var Model = (function () {

  var HISTORY_LIMIT = 288;

  // --- SEUILS POUR LA SERRE ---
  var THRESHOLDS = {
    int: { min: 15.0, max: 30.0 }, // Alertes Serre
    ext: { min: -5.0, max: 40.0 }  // Alertes Extérieur
  };

  var _state = {
    sensors: {
      ext: { current: null, min: null, max: null, history: [] },
      int: { current: null, min: null, max: null, history: [] }
    },
    alerts: [],
    connection: 'connecting'
  };

  var _listeners = {};

  // --- FONCTIONS INTERNES ---

  function on(event, callback) {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(callback);
  }

  function emit(event, data) {
    if (!_listeners[event]) return;
    _listeners[event].forEach(function (cb) { cb(data); });
  }

  // Cette fonction doit être définie AVANT d'être utilisée dans updateSensor
  function getSensor(type) {
    var s = _state.sensors[type];
    return {
      current: s.current,
      min: s.min,
      max: s.max,
      updatedAt: s.updatedAt
    };
  }

  function updateSensor(type, value) {
    var s = _state.sensors[type];
    var now = new Date();
    var limits = THRESHOLDS[type];

    // 1. Détection des alertes (Seuils Serre)
    if (value < limits.min || value > limits.max) {
      var reason = (value < limits.min) ? "Trop froid (min: " + limits.min + "°C)" : "Trop chaud (max: " + limits.max + "°C)";
      var alertObj = {
        ts: now.getTime(),
        type: type,
        value: value,
        reason: reason
      };
      _state.alerts.unshift(alertObj); // Ajoute au début
      if (_state.alerts.length > 50) _state.alerts.pop();
      emit('sensor:alert', alertObj);
    }

    // 2. Gestion des Min/Max journaliers
    if (s.updatedAt && now.getDate() !== new Date(s.updatedAt).getDate()) {
      s.min = value;
      s.max = value;
    } else {
      if (s.min === null || value < s.min) s.min = value;
      if (s.max === null || value > s.max) s.max = value;
    }

    // 3. Mise à jour valeurs actuelles
    s.current = value;
    s.updatedAt = now;

    // 4. Historique
    if (!Array.isArray(s.history)) s.history = [];
    s.history.push({ ts: s.updatedAt.getTime(), value: value });
    if (s.history.length > HISTORY_LIMIT) s.history = s.history.slice(-HISTORY_LIMIT);

    // 5. Notification de mise à jour
    emit('sensor:updated', { type: type, sensor: getSensor(type) });
  }

  function setConnection(status) {
    _state.connection = status;
    emit('connection:changed', { status: status });
  }

  function getHistory(type) {
    var s = _state.sensors[type];
    return Array.isArray(s.history) ? s.history.slice() : [];
  }

  function getAlerts() {
    return _state.alerts;
  }

  function getConnection() {
    return _state.connection;
  }

  // --- EXPOSITION DES METHODES ---
  return {
    on:            on,
    updateSensor:  updateSensor,
    setConnection: setConnection,
    getSensor:     getSensor,
    getConnection: getConnection,
    getHistory:    getHistory,
    getAlerts:     getAlerts
  };

})();