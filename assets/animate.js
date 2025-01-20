// Fonction pour initialiser AOS sur tous les éléments avec [data-aos]
function initializeAOS() {
  // Vérifier si AOS est disponible
  if (typeof AOS === 'undefined') {
    console.error('AOS library not loaded.');
    return;
  }

  // Initialisation d'AOS
  AOS.init({
    duration: 800, // Durée par défaut des animations
    easing: 'ease-in-out', // Easing par défaut
    once: true, // Les animations ne se déclenchent qu'une seule fois
    offset: 120, // Décalage du viewport pour le déclenchement
  });

  console.log('AOS animations initialized.');
}

// Fonction pour réinitialiser AOS dans une section spécifique
function refreshAOSInSection(section) {
  if (!section) return;

  // Vérifier si AOS est disponible
  if (typeof AOS === 'undefined') {
    console.error('AOS library not loaded.');
    return;
  }

  // Rafraîchir AOS uniquement dans la section rechargée
  const aosElements = section.querySelectorAll('[data-aos]');
  if (aosElements.length > 0) {
    // Réinitialisation des animations sur les éléments de la section
    aosElements.forEach((element) => {
      element.classList.remove('aos-animate'); // Supprimer la classe d'animation
      element.setAttribute('data-aos', element.getAttribute('data-aos')); // Reconfirmer les animations
    });

    // Rafraîchir AOS pour appliquer les changements
    AOS.refreshHard();
    console.log(`AOS animations refreshed in section: ${section.id || 'unknown'}`);
  }
}

// Initialisation générale sur tout le DOM
document.addEventListener('DOMContentLoaded', () => {
  initializeAOS();

  // Gestion de la recharge des sections
  if (window.Shopify && window.Shopify.designMode) {
    document.addEventListener('shopify:section:load', (event) => {
      const section = event.target;
      refreshAOSInSection(section);
    });

    document.addEventListener('shopify:section:reorder', (event) => {
      const section = event.target;
      refreshAOSInSection(section);
    });
  }
});
