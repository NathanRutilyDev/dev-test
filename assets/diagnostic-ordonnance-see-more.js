/**
 * Classe pour gérer la liste des produits d'ordonnance et leurs interactions
 */
class OrdonnanceProductList extends HTMLElement {
  // Sélecteurs CSS constants
  static selectors = {
    addToCartButton: 'button[type="submit"].ordonnance__submit',
    selectedProductsContainers: '[data-added-products-result]',
    addedProductContainers: '[data-added-products]',
    totalContainers: '[data-bundle-total]',
    countContainers: '[data-bundle-count]',
    addButton: '[data-add-product]',
    addAllButton: '[data-add-all-products]',
    productInfo: '[data-product-info]',
    removeProduct: '[data-remove-product]',
    productTemplate: 'template',
  };

  // Clé de stockage local
  static STORAGE_KEY = 'selectedProducts';

  constructor() {
    super();
    this.selectedProducts = this.loadSelectedProducts();
    this.initializeElements();
  }

  /**
   * Charge les produits sélectionnés depuis le stockage local
   */
  loadSelectedProducts() {
    try {
      return JSON.parse(localStorage.getItem(OrdonnanceProductList.STORAGE_KEY)) || [];
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      return [];
    }
  }

  /**
   * Initialise les éléments DOM nécessaires
   */
  initializeElements() {
    const { selectors } = OrdonnanceProductList;
    this.addToCartButtons = this.querySelectorAll(selectors.addToCartButton);
    this.selectedProductsContainers = this.querySelectorAll(selectors.selectedProductsContainers);
    this.addedProductContainers = this.querySelectorAll(selectors.addedProductContainers);
    this.totalContainers = this.querySelectorAll(selectors.totalContainers);
    this.countContainers = this.querySelectorAll(selectors.countContainers);
    this.addProductButtons = this.querySelectorAll(selectors.addButton);
    this.addAllButtons = this.querySelectorAll(selectors.addAllButton);
  }

  /**
   * Callback appelé lorsque l'élément est connecté au DOM
   */
  connectedCallback() {
    if (!this.selectedProductsContainers) {
      console.error('Containers des produits sélectionnés non trouvé');
      return;
    }

    this.renderSelectedProducts();
    this.updateTotalPrice();
    this.setupEventListeners();
  }

  /**
   * Configure les écouteurs d'événements
   */
  setupEventListeners() {
    const { selectors } = OrdonnanceProductList;

    // Gestion des boutons d'ajout individuels
    this.querySelectorAll(selectors.addButton).forEach((button) => {
      button.addEventListener('click', () => this.addProductToSelection(button));
    });

    // Gestion des boutons "Ajouter tout"
    this.addAllButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.addAllProducts === 'true') {
          // Si tous les produits sont ajoutés, on les retire tous
          this.selectedProducts = [];
          this.saveSelectedProducts();
        } else {
          // Sinon on ajoute tous les produits disponibles
          this.querySelectorAll(selectors.addButton).forEach((addButton) => {
            if (!addButton.hasAttribute('disabled') && !addButton.classList.contains('added')) {
              this.addProductToSelection(addButton);
            }
          });
        }
        this.renderSelectedProducts();
        this.updateTotalPrice();
        this.updateAddAllButtonState();
      });
    });

    this.querySelectorAll(selectors.addToCartButton).forEach((button) => {
      button.addEventListener('click', () => this.addToCart());
    });
  }

  /**
   * Vérifie si tous les produits disponibles sont ajoutés
   */
  areAllAvailableProductsAdded() {
    const availableButtons = Array.from(this.addProductButtons).filter((button) => !button.hasAttribute('disabled'));
    return availableButtons.every((button) => button.classList.contains('added'));
  }

  /**
   * Met à jour l'état du bouton "Ajouter tout"
   */
  updateAddAllButtonState() {
    const allProductsAdded = this.areAllAvailableProductsAdded();
    this.addAllButtons.forEach((button) => {
      button.dataset.addAllProducts = allProductsAdded.toString();

      if (allProductsAdded) {
        button.classList.remove('button--primary');
        button.classList.add('button--secondary');
      } else {
        button.classList.remove('button--secondary');
        button.classList.add('button--primary');
      }
    });
  }

  /**
   * Affiche les produits sélectionnés
   */
  renderSelectedProducts() {
    if (!this.selectedProductsContainers) return;

    this.selectedProductsContainers.forEach((container) => {
      container.innerHTML = '';
    });

    this.selectedProducts.forEach((product) => {
      const productElement = this.querySelector(`.ordonnance__phase__product[data-variant-id="${product.variantId}"]`);
      if (!productElement) return;

      const template = productElement.querySelector(OrdonnanceProductList.selectors.productTemplate);
      if (!template) return;

      // Pour chaque conteneur, on crée un clone distinct
      this.selectedProductsContainers.forEach((container) => {
        const productContentClone = template.content.cloneNode(true);
        const removeButton = productContentClone.querySelector(OrdonnanceProductList.selectors.removeProduct);

        if (removeButton) {
          removeButton.addEventListener('click', () => this.removeProduct(product.variantId));
        }

        container.appendChild(productContentClone);
      });
    });

    this.updateButtonStates();
    this.updateSelectedProductsTitleVisibility();
    this.updateAddAllButtonState();
  }

  /**
   * Supprime un produit de la sélection
   */
  removeProduct(variantId) {
    this.selectedProducts = this.selectedProducts.filter((p) => p.variantId !== variantId);
    this.saveSelectedProducts();

    this.renderSelectedProducts();
    this.updateTotalPrice();
    this.updateButtonStates();
    this.updateSelectedProductsTitleVisibility();
    this.updateAddAllButtonState();
  }

  /**
   * Ajoute ou retire un produit de la sélection
   */
  addProductToSelection(element) {
    const variantId = element.dataset.variantId;
    if (!variantId) return;

    // Si le produit est déjà sélectionné, on le retire
    if (element.classList.contains('added')) {
      this.removeProduct(variantId);
      return;
    }

    // Sinon, on l'ajoute
    const productContainer = element.closest('.ordonnance__content');
    if (!productContainer) return;

    const productInfoElement = productContainer.querySelector(OrdonnanceProductList.selectors.productInfo);
    if (!productInfoElement) {
      console.error('Élément productInfo non trouvé');
      return;
    }

    try {
      const productData = JSON.parse(productInfoElement.textContent);
      this.selectedProducts.push(productData);
      this.saveSelectedProducts();

      this.renderSelectedProducts();
      this.updateTotalPrice();
      this.updateButtonStates();
      this.updateProductsAddedContainers();
      this.updateAddAllButtonState();
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
    }
  }

  /**
   * Sauvegarde les produits sélectionnés dans le stockage local
   */
  saveSelectedProducts() {
    try {
      localStorage.setItem(OrdonnanceProductList.STORAGE_KEY, JSON.stringify(this.selectedProducts));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des produits:', error);
    }
  }

  /**
   * Met à jour l'état des boutons
   */
  updateButtonStates() {
    this.addProductButtons.forEach((button) => {
      const variantId = button.dataset.variantId;

      this.selectedProducts.some((p) => p.variantId === variantId)
        ? button.classList.add('added')
        : button.classList.remove('added');
    });
  }

  /**
   * Met à jour le prix total
   */
  updateTotalPrice() {
    const totalPrice = this.selectedProducts.reduce((sum, product) => {
      const price = parseFloat(product.price.replace(/[^\d.-]/g, '')) || 0;
      return sum + price / 100;
    }, 0);

    const formattedPrice =
      new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(totalPrice) + '€';

    this.totalContainers.forEach((element) => {
      element.textContent = formattedPrice;
    });

    this.countContainers.forEach((element) => {
      element.textContent = this.selectedProducts.length;
    });
  }

  /**
   * Met à jour la visibilité du titre des produits sélectionnés
   */
  updateSelectedProductsTitleVisibility() {
    this.addedProductContainers.forEach((element) => {
      element.dataset.addedProducts = this.selectedProducts.length ? 'true' : 'false';
    });
  }

  /**
   * Met à jour les conteneurs de produits ajoutés
   */
  updateProductsAddedContainers() {
    this.addedProductContainers.forEach((container) => {
      container.dataset.addedProducts = this.selectedProducts.length > 0 ? 'true' : 'false';
    });
  }

  /**
   * Ajoute les produits sélectionnés au panier
   */
  async addToCart() {
    if (this.selectedProducts.length === 0) return;

    const cartData = {
      items: this.selectedProducts.map((product) => ({
        id: Number(product.variantId),
        quantity: 1,
        properties: {
          Ordonnance: this.dataset.ordonnanceName,
        },
      })),
    };

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'ajout au panier");
      }

      // Réinitialisation et redirection
      localStorage.removeItem(OrdonnanceProductList.STORAGE_KEY);
      this.selectedProducts = [];
      this.renderSelectedProducts();
      this.updateTotalPrice();
      window.location.href = '/cart';
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      alert("Impossible d'ajouter les produits au panier. Veuillez réessayer.");
    }
  }
}

// Enregistrement du composant personnalisé
customElements.define('ordonnance-product-list', OrdonnanceProductList);
