// Connexion au WebSocket
const socket = new WebSocket('wss://ws.hothothot.dog:9502');

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