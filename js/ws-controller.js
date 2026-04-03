var WSController = (function () {

  var WS_URL     = 'wss://ws.hothothot.dog:9502';
  var MIN_DELAY  = 2000;
  var MAX_DELAY  = 30000;

  var INACTIVITY_TIMEOUT = 90000; // 1min30

  var _ws              = null;
  var _retryDelay      = MIN_DELAY;
  var _retryTimer      = null;
  var _inactivityTimer = null;

  function _resetInactivityTimer() {
    clearTimeout(_inactivityTimer);
    _inactivityTimer = setTimeout(function () {
      try { console.log('[WS] aucune donnée depuis 90s, bascule en AJAX'); } catch(e){}
      if (_ws) _ws.close();
    }, INACTIVITY_TIMEOUT);
  }

  function _parse(raw) {
    var parsed, list;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return;
    }

    list = Array.isArray(parsed) ? parsed : (parsed.sensors || parsed.capteurs || parsed.data || []);

    list.forEach(function (sensor) {
      var rawVal = sensor.temperature || sensor.temp || sensor.value || sensor.Valeur || sensor.Valeur || sensor.valeur;
      if (typeof rawVal === 'string') rawVal = rawVal.replace(',', '.');
      var t  = parseFloat(rawVal);

      var rawId = sensor.id || sensor.name || sensor.Nom || sensor.type || sensor.nom || '';
      var id = String(rawId).toLowerCase();

      if (isNaN(t)) return;

      if (id.indexOf('ext') !== -1 || id.indexOf('exter') !== -1 || id === '0' || id === 'outdoor' || id.indexOf('exterieur') !== -1) {
        Model.updateSensor('ext', t);
      } else if (id.indexOf('int') !== -1 || id.indexOf('inter') !== -1 || id === '1' || id === 'indoor' || id.indexOf('interieur') !== -1) {
        Model.updateSensor('int', t);
      } else {
        var nom = String(sensor.Nom || sensor.nom || '').toLowerCase();
        if (nom.indexOf('exter') !== -1) Model.updateSensor('ext', t);
        else if (nom.indexOf('inter') !== -1) Model.updateSensor('int', t);
      }
    });
  }

  function _connect() {
    _ws = new WebSocket(WS_URL);

    _ws.addEventListener('open', function () {
      _retryDelay = MIN_DELAY;
      clearTimeout(_retryTimer);
      AJAXController.stop();
      Model.setConnection('ws');
      try { console.log('[WS] open', WS_URL); } catch(e){}
      _ws.send('getTemperature');
      _resetInactivityTimer();
    });

    _ws.addEventListener('message', function (e) {
      try { console.log('[WS] message', e.data); } catch(e){}
      _resetInactivityTimer();
      _parse(e.data);
    });

    _ws.addEventListener('close', function () {
      try { console.log('[WS] close, fallback to AJAX'); } catch(e){}
      clearTimeout(_inactivityTimer);
      Model.setConnection('ajax');
      AJAXController.start();
      _retryTimer = setTimeout(_connect, _retryDelay);
      _retryDelay = Math.min(_retryDelay * 2, MAX_DELAY);
    });

    _ws.addEventListener('error', function () {
      try { console.log('[WS] error'); } catch(e){}
      _ws.close();
    });
  }

  return {
    init: _connect
  };

})();
