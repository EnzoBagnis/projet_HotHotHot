<!DOCTYPE html>
<html lang="fr">
<head>
    <link rel="manifest" href="manifest.json">
    <meta charset="UTF-8">
    <title>Températures en Temps Réel</title>
    <style>
        .sensor-card {
            border: 1px solid #ccc;
            padding: 20px;
            margin: 10px;
            display: inline-block;
            border-radius: 8px;
            text-align: center;
        }
        .temp-value { font-size: 2em; font-weight: bold; color: #e74c3c; }
        .status { font-size: 0.8em; color: gray; }
    </style>
</head>
<body>

<h1>Données HotHotHot</h1>

<div id="sensor-1" class="sensor-card">
    <h3>Capteur Intérieur</h3>
    <div class="temp-value">-- °C</div>
    <div class="status">En attente...</div>
</div>

<div id="sensor-2" class="sensor-card">
    <h3>Capteur Extérieur</h3>
    <div class="temp-value">-- °C</div>
    <div class="status">En attente...</div>
</div>

<button id="install-app" style="display: none;">Installer l'application</button>


<script src="script.js"></script>
</body>
</html>