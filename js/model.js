var Model = (function () {

  var HISTORY_LIMIT = 288;
  var _state = {
    sensors: {
      ext: { current: null, min: null, max: null, history: [] },
      int: { current: null, min: null, max: null, history: [] }
    },
    connection: 'connecting'
  };

  var _listeners = {};

  function on(event, callback) {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(callback);
  }

  function emit(event, data) {
    if (!_listeners[event]) return;
    _listeners[event].forEach(function (cb) { cb(data); });
  }

  function updateSensor(type, value) {
    var s = _state.sensors[type];
    var now = new Date();

    if (s.updatedAt && now.getDate() !== new Date(s.updatedAt).getDate()) {
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

    try {
      console.log('[Model] updated', type, value, 'Min:', s.min, 'Max:', s.max);
    } catch (e) { }
  }

  function setConnection(status) {
    _state.connection = status;
    emit('connection:changed', { status: status });
  }

  function getSensor(type) {
    var s = _state.sensors[type];
    return { current: s.current, min: s.min, max: s.max, updatedAt: s.updatedAt };
  }

  function getHistory(type) {
    var s = _state.sensors[type];
    return Array.isArray(s.history) ? s.history.slice() : [];
  }

  function getConnection() {
    return _state.connection;
  }

  return {
    on:            on,
    updateSensor:  updateSensor,
    setConnection: setConnection,
    getSensor:     getSensor,
    getConnection: getConnection,
    getHistory:    getHistory
  };

})();
