var AJAXController = (function () {

  var REMOTE_API_URL = 'https://api.hothothot.dog/api/sensors';
  var LOCAL_API_URL  = '/projet_HotHotHot/api/sensors';
  var MODE = 'remote';

  function setMode(mode) {
    if (mode === 'remote' || mode === 'local' || mode === 'auto') MODE = mode;
    console.log('[AJAX] mode set to', MODE);
  }
   var POLL_INTERVAL = 10000;

  var _timer = null;

  function _processList(data) {
    var list = Array.isArray(data) ? data : (data.sensors || data.capteurs || data.data || []);

    list.forEach(function (sensor) {
      var rawVal = sensor.temperature || sensor.temp || sensor.value || sensor.Valeur || sensor.valeur;
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

  function _poll() {
    function fetchWithTimeout(url, timeoutMs) {
      var controller = new AbortController();
      var signal = controller.signal;
      try { console.log('[AJAX] fetchWithTimeout start', url, 'timeout=', timeoutMs); } catch(e){}
      var timer = setTimeout(function(){ controller.abort(); }, timeoutMs);
      return fetch(url, { signal: signal }).finally(function(){ clearTimeout(timer); });
    }

    function fetchAndParse(url) {
      try { console.log('[AJAX] fetching', url); } catch(e){}
      return fetchWithTimeout(url, 15000)
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(function (text) {
          if (!text || text.trim().length === 0) throw new Error('Empty response');
          try {
            return JSON.parse(text);
          } catch (e) {
            try { console.log('[AJAX] invalid JSON response from', url, text); } catch(ee){}
            throw e;
          }
        });
    }

    var attempt;
    if (MODE === 'remote') {
      attempt = fetchAndParse(REMOTE_API_URL);
    } else if (MODE === 'local') {
      attempt = fetchAndParse(LOCAL_API_URL);
    } else {
      attempt = fetchAndParse(REMOTE_API_URL).catch(function (errRemote) {
        try { console.log('[AJAX] remote failed, trying local fallback', errRemote && errRemote.message); } catch(e){}
        return fetchAndParse(LOCAL_API_URL);
      });
    }

    attempt
      .then(function (data) {
        try { console.log('[AJAX] data', data); } catch(e){}
        _processList(data);
        Model.setConnection('ajax');
        try { var lbl = document.getElementById('conn-label'); if (lbl) lbl.textContent = 'Mode AJAX (fallback)'; } catch(e){}
      })
      .catch(function (err) {
        try { console.log('[AJAX] error', err && err.message); } catch(e){}
        Model.setConnection('error');
        try {
          var lbl = document.getElementById('conn-label');
          var msg = (err && err.name === 'AbortError') ? 'AJAX timeout' : (err && err.message ? err.message : 'Erreur AJAX');
          if (lbl) lbl.textContent = msg;
        } catch (e) {}
      })
      .finally(function () {
        _timer = setTimeout(_poll, POLL_INTERVAL);
      });
  }

  return {
    start: function () {
      if (_timer === null) _poll();
    },
    stop: function () {
      clearTimeout(_timer);
      _timer = null;
    }
    , setMode: setMode
  };

})();
