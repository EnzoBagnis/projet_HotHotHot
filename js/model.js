var Model = (function () {
  var THRESHOLDS = {
    int: { min: 15.0, max: 30.0 },
    ext: { min: -5.0, max: 40.0 }
  };

  var _state = {
    sensors: {
      ext: { current: null, min: null, max: null, history: [] },
      int: { current: null, min: null, max: null, history: [] }
    },
    alerts: [],
    connection: 'connecting'
  };


  function updateSensor(type, value) {
    var s = _state.sensors[type];
    var now = new Date();
    var limits = THRESHOLDS[type];

    if (value < limits.min || value > limits.max) {
      var reason = (value < limits.min) ? "Trop froid (Seuil: " + limits.min + "°C)" : "Trop chaud (Seuil: " + limits.max + "°C)";
      var alertObj = {
        ts: now.getTime(),
        type: type,
        value: value,
        reason: reason
      };
      _state.alerts.unshift(alertObj);
      if (_state.alerts.length > 50) _state.alerts.pop();
      emit('sensor:alert', alertObj);
    }

    if (s.updatedAt && now.getDate() !== now.getDate()) {
      s.min = value; s.max = value;
    } else {
      if (s.min === null || value < s.min) s.min = value;
      if (s.max === null || value > s.max) s.max = value;
    }
    s.current = value;
    s.updatedAt = now;

    emit('sensor:updated', { type: type, sensor: getSensor(type) });
  }

  function getAlerts() { return _state.alerts; }

  return {
    updateSensor: updateSensor,
    getAlerts: getAlerts,
    getSensor: getSensor,
    on: on,
  };
})();