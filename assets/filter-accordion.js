customElements.define(
    'filter-accordion',
    class FilterAccordion extends HTMLElement {
      constructor() {
        super();
      }
  
      connectedCallback() {
        // On récupère les boutons et les panneaux à l'intérieur du custom element
        this.buttons = this.querySelectorAll('.simple-button');
        this.panels = this.querySelectorAll('.filter-panel');
        this.setupListeners();

        // Gestion mobile :
        this.mobileToggle = this.querySelector('.filter-accordion-mobile__toggle');
        this.mobileClose = this.querySelector('.filter-accordion-mobile__close');

        if (this.mobileToggle) {
          this.mobileToggle.addEventListener('click', () => {
            // On ajoute une classe (ici "open") sur le custom element pour déclencher l'affichage en overlay
            this.classList.add('open');
          });
        }
        if (this.mobileClose) {
          this.mobileClose.addEventListener('click', () => {
            // On retire la classe "open" pour fermer l'overlay
            this.classList.remove('open');
          });
        }
      }
  
      setupListeners() {
        this.buttons.forEach(button => {
          button.addEventListener('click', () => {
            const filterKey = button.getAttribute('data-filter');
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
  
            // Ferme tous les boutons et panneaux
            this.buttons.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
            this.panels.forEach(panel => panel.classList.remove('active'));
  
            // Si le bouton cliqué était déjà ouvert, on le referme
            // Sinon, on ouvre le panneau correspondant
            if (!isExpanded) {
              button.setAttribute('aria-expanded', 'true');
              const panel = this.querySelector(`.filter-panel[data-filter="${filterKey}"]`);
              if (panel) {
                panel.classList.add('active');
              }
            }
          });
        });
      }
    }
  );
  