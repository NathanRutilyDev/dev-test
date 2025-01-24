class SearchBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .search-bar {
          position: relative;
          width: 100%;
        }

        .search-input-container {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #fff;
        }

        .search-input {
          flex: 1;
          padding: 8px;
          font-size: 14px;
          border: none;
          outline: none;
        }

        .search-button {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .search-results {
          position: absolute;
          top: 100%; /* Place les résultats juste en dessous de l'input */
          left: 0;
          width: 100%;
          max-height: calc(3 * 70px); /* Limite à 3 lignes */
          overflow-y: auto; /* Permet le défilement si plus de 3 résultats */
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #fff;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .product-card {
          display: flex;
          align-items: center;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #fff;
          transition: background-color 0.2s ease;
        }

        .product-card:hover {
          background-color: #f9f9f9;
        }

        .product-card img {
          width: 50px;
          height: 50px;
          margin-right: 8px;
          border-radius: 4px;
        }

        .product-card h3 {
          font-size: 14px;
          font-weight: bold;
          margin: 0;
        }

        .product-card p {
          font-size: 12px;
          color: #666;
          margin: 0;
        }
      </style>
      <div class="search-bar">
        <div class="search-input-container">
          <input type="text" class="search-input" placeholder="Rechercher des produits..." />
          <button class="search-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
              <path d="M17.5 17.5L22 22M20 11C20 8.61305 19.0518 6.32387 17.364 4.63604C15.6761 2.94821 13.3869 2 11 2C8.61305 2 6.32387 2.94821 4.63604 4.63604C2.94821 6.32387 2 8.61305 2 11C2 13.3869 2.94821 15.6761 4.63604 17.364C6.32387 19.0518 8.61305 20 11 20C13.3869 20 15.6761 19.0518 17.364 17.364C19.0518 15.6761 20 13.3869 20 11Z" stroke="#443D36" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="search-results"></div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const input = this.shadowRoot.querySelector('.search-input');
    const resultsContainer = this.shadowRoot.querySelector('.search-results');
    let debounceTimer;

    input.addEventListener('input', (e) => {
      const query = e.target.value.trim();

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (query.length > 0) {
          this.fetchProducts(query)
            .then((products) => this.renderProducts(products, resultsContainer));
        } else {
          resultsContainer.innerHTML = ''; // Vider les résultats si aucune recherche
        }
      }, 300);
    });
  }

  async fetchProducts(query) {
    const response = await fetch(`/search/suggest.json?q=${query}&resources[type]=product`);
    const data = await response.json();
    return data.resources.results.products || [];
  }

  renderProducts(products, container) {
    container.innerHTML = ''; // Réinitialise les anciens résultats

    if (products.length === 0) {
      container.innerHTML = '<p>Aucun produit trouvé.</p>';
      return;
    }

    // Limite à 3 résultats
    products.slice(0, 3).forEach((product) => {
      const productHTML = `
        <div class="product-card">
          <img src="${product.featured_image.url}" alt="${product.title}" />
          <div>
            <h3>${product.title}</h3>
            <p>${product.price}</p>
          </div>
        </div>
      `;
      container.innerHTML += productHTML;
    });
  }
}

// Déclarer le Custom Element
customElements.define('search-bar', SearchBar);
