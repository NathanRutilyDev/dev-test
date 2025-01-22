customElements.define(
  'swiper-slider',
  class SwiperSlider extends HTMLElement {
    constructor() {
      super();
      this.swiper = null;
      this.config = null;
    }

    connectedCallback() {
      this.loadConfig();
      this.initSwiper();
      window.addEventListener('resize', this.handleResize.bind(this));
    }

    disconnectedCallback() {
      this.destroySwiper();
      window.removeEventListener('resize', this.handleResize.bind(this));
    }

    loadConfig() {
      const script = this.querySelector('script[type="application/json"]');
      if (script) {
        try {
          this.config = JSON.parse(script.textContent);
        } catch (e) {
          console.error('Invalid JSON configuration in <swiper-slider>: ', e);
        }
      } else {
        this.config = {};
      }
    }

    initSwiper() {
      if (this.swiper) return;

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
