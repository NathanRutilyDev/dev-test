customElements.define(
  'predictive-articles',
  class PredictiveArticles extends HTMLElement{
    constructor() {
      super();
    }

    connectedCallback() {
      this.searchInput = document.querySelector('[data-search-input]');
      this.resultsContainer = document.getElementById('search-results');
      this.searchContainer = document.querySelector('.search-container');
      this.abortController = new AbortController();
      
      if (this.searchInput) {
        this.moveResultsContainer();
        this.setupEventListeners();
      }
    }

    // Déplace la div des résultats en dehors de la bannière
    moveResultsContainer() {
      const heroBanner = document.querySelector('.hero-banner');
      if (this.resultsContainer && heroBanner) {
        heroBanner.insertAdjacentElement('afterend', this.resultsContainer);
      }
    }

    // Positionne dynamiquement les résultats sous la barre de recherche
    positionResultsContainer() {
      const inputRect = this.searchInput.getBoundingClientRect();
      this.resultsContainer.style.position = 'absolute';
      this.resultsContainer.style.top = `${inputRect.bottom + window.scrollY}px`; // Position en bas du champ
      this.resultsContainer.style.left = `${inputRect.left + window.scrollX - 20}px`; // Aligné à gauche du champ
      this.resultsContainer.style.width = `${inputRect.width + 64}px`; // Même largeur que le champ
    }

    setupEventListeners() {
      this.searchInput.addEventListener('input', this.onSearchInput.bind(this));
      this.searchInput.addEventListener('focus', () => {
        this.positionResultsContainer(); // Met à jour la position lors du focus
      });
      window.addEventListener('resize', this.positionResultsContainer.bind(this));
      window.addEventListener('scroll', this.positionResultsContainer.bind(this));

      document.addEventListener('click', (event) => {
        if (!this.resultsContainer.contains(event.target) && event.target !== this.searchInput) {
          this.resultsContainer.classList.remove('active');
          this.searchContainer.classList.remove('has-results');
        }
      });
    }

    onSearchInput(event) {
      const searchTerm = event.target.value.trim();

      if (searchTerm.length < 3) {
        this.clearResults();
        return;
      }

      this.fetchSearchResults(searchTerm);
    }

    fetchSearchResults(query) {
      // Annule toute requête précédente
      this.abortController.abort();
      this.abortController = new AbortController();

      fetch(`/search/suggest?q=${encodeURIComponent(query)}&resources[type]=article&resources[limit]=3&section_id=predictive-articles`, {
        signal: this.abortController.signal,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.text();
        })
        .then((html) => {
          if (html.trim() === '') {
            this.clearResults();
            return;
          }
          this.resultsContainer.innerHTML = html;
          this.resultsContainer.classList.add('active');
          this.searchContainer.classList.add('has-results');
        })
        .catch((error) => {
          if (error.name !== 'AbortError') console.error('Search error:', error);
        });
    }

    clearResults() {
      this.resultsContainer.innerHTML = '';
      this.resultsContainer.classList.remove('active');
      this.searchContainer.classList.remove('has-results');
    }
  }
);
