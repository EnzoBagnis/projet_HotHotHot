var Model = (function () {
  var HISTORY_LIMIT = 288;

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

  var _listeners = {};

  function on(event, callback) {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(callback);
  }

  function emit(event, data) {
    if (!_listeners[event]) return;
    _listeners[event].forEach(function (cb) { try { cb(data); } catch(e) { console.error(e); } });
  }

  function getSensor(type) {
    var s = _state.sensors[type];
    return { current: s.current, min: s.min, max: s.max, updatedAt: s.updatedAt };
  }

  function updateSensor(type, value) {
    if (!_state.sensors[type]) return;
    var s = _state.sensors[type];
    var now = new Date();
    var limits = THRESHOLDS[type];

    if (value < limits.min || value > limits.max) {
      var reason = (value < limits.min) ? "FAIT TARPIN FROID" : "FAIT TARPIN CHAUD";
      var alertObj = { ts: now.getTime(), type: type, value: value, reason: reason + " (" + value.toFixed(1) + "°C)" };
      _state.alerts.unshift(alertObj);
      if (_state.alerts.length > 50) _state.alerts.pop();
      emit('sensor:alert', alertObj);
    }

    var lastUpdate = s.updatedAt ? new Date(s.updatedAt) : null;
    if (lastUpdate && now.getDate() !== lastUpdate.getDate()) {
      s.min = value;
      s.max = value;
    } else {
      if (s.min === null || value < s.min) s.min = value;
      if (s.max === null || value > s.max) s.max = value;
    }

    s.current = value;
    s.updatedAt = now;

    if (!Array.isArray(s.history)) s.history = [];
    s.history.push({ ts: s.updatedAt.getTime(), value: value });
    if (s.history.length > HISTORY_LIMIT) s.history = s.history.slice(-HISTORY_LIMIT);

    emit('sensor:updated', { type: type, sensor: getSensor(type) });
  }

  return {
    on: on,
    updateSensor: updateSensor,
    setConnection: function(status) { _state.connection = status; emit('connection:changed', { status: status }); },
    getSensor: getSensor,
    getHistory: function(type) { return (_state.sensors[type].history || []).slice(); },
    getAlerts: function() { return _state.alerts; },
    getConnection: function() { return _state.connection; }
  };
})();