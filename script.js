// Connexion au WebSocket
const socket = new WebSocket('wss://ws.hothothot.dog:9502');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// Gestion de l'installation de la PWA
let deferredPrompt;
const installButton = document.getElementById('install-app');

// Cacher le bouton par défaut
if (installButton) {
  installButton.style.display = 'none';
}

window.addEventListener('beforeinstallprompt', (e) => {
  // Empêcher l'affichage automatique de l'invite
  e.preventDefault();
  // Stocker l'événement pour pouvoir le déclencher plus tard
  deferredPrompt = e;
  // Afficher le bouton d'installation
  if (installButton) {
    installButton.style.display = 'block';
  }
});

if (installButton) {
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      // Afficher l'invite d'installation
      deferredPrompt.prompt();

      // Attendre que l'utilisateur réponde à l'invite
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`L'utilisateur a ${outcome === 'accepted' ? 'accepté' : 'refusé'} l'installation`);

      // Réinitialiser deferredPrompt, car il ne peut être utilisé qu'une seule fois
      deferredPrompt = null;
      // Cacher le bouton après la décision
      installButton.style.display = 'none';
    }
  });
}

// Évènement lors de l'ouverture de la connexion
socket.onopen = () => {
    console.log("Connecté au serveur WebSocket");
    // Si le serveur nécessite un message d'abonnement, l'envoyer ici :
    // socket.send(JSON.stringify({ "command": "subscribe" }));
};

// Évènement lors de la réception d'un message
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Données reçues :", data);

    // Adaptation selon la structure de l'objet JSON reçu de HotHotHot
    // Imaginons que le JSON ressemble à : { "capteurs": [ { "Nom": "Extérieur", "Valeur": 21.5 }, ... ] }
    if (data.capteurs) {
        data.capteurs.forEach((capteur, index) => {
            // On cible l'élément HTML (sensor-1 pour le premier, sensor-2 pour le second)
            const card = document.getElementById(`sensor-${index + 1}`);
            if (card) {
                card.querySelector('.temp-value').innerText = capteur.Valeur + " °C";
                card.querySelector('h3').innerText = capteur.Nom;
                card.querySelector('.status').innerText = "Dernière mise à jour : " + new Date().toLocaleTimeString();
            }
        });
    }
};

// Gestion des erreurs
socket.onerror = (error) => {
    console.error("Erreur WebSocket :", error);
};

// Gestion de la fermeture
socket.onclose = () => {
    console.log("Connexion WebSocket fermée");
};