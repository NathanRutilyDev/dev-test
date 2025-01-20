customElements.define(
  'swiper-slider',
  class SwiperSlider extends HTMLElement {
    constructor() {
      super();
      this.swiper = null; // Instance de Swiper
      this.config = null; // Configuration JSON
    }

    connectedCallback() {
      console.log('ok');
      this.loadConfig();
      this.initSwiper();
      window.addEventListener('resize', this.handleResize.bind(this));
    }

    disconnectedCallback() {
      this.destroySwiper();
      window.removeEventListener('resize', this.handleResize.bind(this));
    }

    loadConfig() {
      // Récupère la configuration JSON
      const script = this.querySelector('script[type="application/json"]');
      if (script) {
        try {
          this.config = JSON.parse(script.textContent);
        } catch (e) {
          console.error('Invalid JSON configuration in <swiper-slider>: ', e);
        }
      } else {
        this.config = {}; // Configuration par défaut
      }
    }

    initSwiper() {
      if (this.swiper) return; // Évite les réinitialisations inutiles

      const defaultConfig = {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: false,
        draggable: true,
      };

      const swiperConfig = {
        ...defaultConfig,
        ...this.config,
      };

      console.log('Swiper configuration:', swiperConfig);

      // Initialise Swiper.js
      this.swiper = new Swiper(this, swiperConfig);
    }

    destroySwiper() {
      if (this.swiper) {
        this.swiper.destroy(true, true);
        this.swiper = null;
      }
    }

    handleResize() {
      const prevConfig = this.config;
      this.loadConfig();

      // Réinitialise le swiper si la configuration a changé
      if (JSON.stringify(prevConfig) !== JSON.stringify(this.config)) {
        this.destroySwiper();
        this.initSwiper();
      }
    }
  },
);
