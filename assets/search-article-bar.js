class ArticleSearch {
  constructor() {
    this.searchInput = document.querySelector('[data-search-input]');
    this.resultsContainer = document.getElementById('search-results');
    this.abortController = new AbortController();

    if (this.searchInput) {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    this.searchInput.addEventListener('input', this.onSearchInput.bind(this));
    this.searchInput.addEventListener('focus', () => this.resultsContainer.classList.add('active'));
    document.addEventListener('click', (event) => {
      if (!this.resultsContainer.contains(event.target) && event.target !== this.searchInput) {
        this.resultsContainer.classList.remove('active');
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

    fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=article&resources[limit]=3`, {
      signal: this.abortController.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((data) => this.renderResults(data.resources.results.articles))
      .catch((error) => {
        if (error.name !== 'AbortError') console.error('Search error:', error);
      });
  }

  renderResults(articles) {
    if (!articles || articles.length === 0) {
      this.clearResults();
      return;
    }

    this.resultsContainer.innerHTML = articles
      .map(
        (article) => `
        <div class="search-result-item">
          <a href="${article.url}">
            <h4>${article.title}</h4>
            <p>${article.published_at}</p>
          </a>
        </div>
      `
      )
      .join('');
  }

  clearResults() {
    this.resultsContainer.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ArticleSearch();
});
