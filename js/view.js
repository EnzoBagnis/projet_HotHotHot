var View = (function () {

  var COLORS = {
    hot:    '#ff4d1c',
    warm:   '#ff9500',
    ok:     '#22c55e',
    cool:   '#00b4d8',
    cold:   '#4361ee'
  };

  function _tempColor(val, isExt) {
    if (val === null) return '#555';
    if (isExt) {
      if (val > 35) return COLORS.hot;
      if (val > 25) return COLORS.warm;
      if (val < 0)  return COLORS.cold;
      if (val < 10) return COLORS.cool;
    } else {
      if (val > 50) return COLORS.hot;
      if (val > 22) return COLORS.warm;
      if (val < 0)  return COLORS.cold;
      if (val < 12) return COLORS.cool;
    }
    return COLORS.ok;
  }

  function renderSensor(type, sensor) {
    var color = _tempColor(sensor.current, type === 'ext');

    var valEl = document.getElementById('val-' + type);
    var display = '--';
    if (sensor && typeof sensor.current === 'number' && !isNaN(sensor.current)) {
      display = sensor.current.toFixed(1);
    }
    if (valEl) valEl.textContent = display;

    var minEl = document.getElementById('min-' + type);
    if (minEl) {
      minEl.textContent = (sensor.min !== null) ? sensor.min.toFixed(1) : '--';
    }

    var maxEl = document.getElementById('max-' + type);
    if (maxEl) {
      maxEl.textContent = (sensor.max !== null) ? sensor.max.toFixed(1) : '--';
    }

    var tempEl = document.getElementById('temp-' + type);
    if (tempEl) {
      tempEl.style.color = color;
      tempEl.style.textShadow = '0 0 40px ' + color;
    }

    if (sensor && sensor.updatedAt) {
      var timeEl = document.getElementById('last-time');
      if (timeEl) {
        var dateObj = (sensor.updatedAt instanceof Date) ? sensor.updatedAt : new Date(sensor.updatedAt);
        timeEl.textContent = dateObj.toLocaleTimeString('fr-FR');
      }
    }
  }

  function renderHistory(extHistory, intHistory) {
    var svg = document.getElementById('history-graph');
    if (!svg) return;

    var W = 600, H = 240, P = 40;

    var all = (extHistory || []).concat(intHistory || []);
    if (all.length === 0) {
      svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="#888">Pas de données historiques</text>';
      var le = document.getElementById('legend-ext-value'); if (le) le.textContent = '--';
      var li = document.getElementById('legend-int-value'); if (li) li.textContent = '--';
      return;
    }

    var minTs = Math.min.apply(null, all.map(function(o){return o.ts;}));
    var maxTs = Math.max.apply(null, all.map(function(o){return o.ts;}));
    var minV  = Math.min.apply(null, all.map(function(o){return parseFloat(o.value);}));
    var maxV  = Math.max.apply(null, all.map(function(o){return parseFloat(o.value);}));
    if (isNaN(minV) || isNaN(maxV)) { svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="#888">Données invalides</text>'; return; }
    if (minV === maxV) { minV -= 1; maxV += 1; }

    function xFor(ts) { return P + ( (ts - minTs) / (maxTs - minTs || 1) ) * (W - 2*P); }
    function yFor(v)  { return H - P - ( (v - minV) / (maxV - minV || 1) ) * (H - 2*P); }

    function pathFor(list) {
      if (!list || list.length === 0) return '';
      var pts = list.map(function(p){ return xFor(p.ts) + ',' + yFor(parseFloat(p.value)); });
      return 'M' + pts.join(' L ');
    }

    var extPath = pathFor(extHistory);
    var intPath = pathFor(intHistory);

    var svgInner = '';
    svgInner += '<line x1="' + P + '" y1="' + (H-P) + '" x2="' + (W-P) + '" y2="' + (H-P) + '" stroke="#ddd" stroke-width="1"/>';
    svgInner += '<line x1="' + P + '" y1="' + P + '" x2="' + P + '" y2="' + (H-P) + '" stroke="#ddd" stroke-width="1"/>';

    var midV = (minV + maxV) / 2;
    var yMax = yFor(maxV), yMid = yFor(midV), yMin = yFor(minV);
    svgInner += '<line x1="' + P + '" y1="' + yMax + '" x2="' + (W-P) + '" y2="' + yMax + '" stroke="#2a2a2a" stroke-width="1"/>';
    svgInner += '<line x1="' + P + '" y1="' + yMid + '" x2="' + (W-P) + '" y2="' + yMid + '" stroke="#222" stroke-width="1"/>';
    svgInner += '<line x1="' + P + '" y1="' + yMin + '" x2="' + (W-P) + '" y2="' + yMin + '" stroke="#2a2a2a" stroke-width="1"/>';
    svgInner += '<text x="8" y="' + (yMax+4) + '" font-size="11" fill="#999">' + maxV.toFixed(1).replace('-', '−') + '</text>';
    svgInner += '<text x="8" y="' + (yMid+4) + '" font-size="11" fill="#999">' + midV.toFixed(1) + '</text>';
    svgInner += '<text x="8" y="' + (yMin+4) + '" font-size="11" fill="#999">' + minV.toFixed(1) + '</text>';
    svgInner += '<text x="' + (W-34) + '" y="' + (yMax+4) + '" font-size="11" fill="#999">' + maxV.toFixed(1) + '</text>';
    svgInner += '<text x="' + (W-34) + '" y="' + (yMid+4) + '" font-size="11" fill="#999">' + midV.toFixed(1) + '</text>';
    svgInner += '<text x="' + (W-34) + '" y="' + (yMin+4) + '" font-size="11" fill="#999">' + minV.toFixed(1) + '</text>';

    if (extPath) svgInner += '<path d="' + extPath + '" fill="none" stroke="#ff9500" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    if (intPath) svgInner += '<path d="' + intPath + '" fill="none" stroke="#00b4d8" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';

    var startTime = new Date(minTs).toLocaleTimeString('fr-FR');
    var endTime = new Date(maxTs).toLocaleTimeString('fr-FR');
    svgInner += '<text x="' + P + '" y="' + (H-6) + '" font-size="10" fill="#777">' + startTime + '</text>';
    svgInner += '<text x="' + (W - P - 40) + '" y="' + (H-6) + '" font-size="10" fill="#777">' + endTime + '</text>';

    function lastPoint(list) {
      if (!list || list.length === 0) return null;
      var p = list[list.length-1];
      return { x: xFor(p.ts), y: yFor(parseFloat(p.value)), v: parseFloat(p.value), ts: p.ts };
    }
    var lastExt = lastPoint(extHistory);
    var lastInt = lastPoint(intHistory);
    if (lastExt) {
      svgInner += '<circle cx="' + lastExt.x + '" cy="' + lastExt.y + '" r="3.5" fill="#ff9500"><title>Exterieur: ' + lastExt.v.toFixed(1) + '°C</title></circle>';
      svgInner += '<text x="' + (lastExt.x + 6) + '" y="' + (lastExt.y + 4) + '" font-size="11" fill="#ffb36a">' + lastExt.v.toFixed(1) + '°C</text>';
    }
    if (lastInt) {
      svgInner += '<circle cx="' + lastInt.x + '" cy="' + lastInt.y + '" r="3.5" fill="#00b4d8"><title>Interieur: ' + lastInt.v.toFixed(1) + '°C</title></circle>';
      svgInner += '<text x="' + (lastInt.x + 6) + '" y="' + (lastInt.y - 6) + '" font-size="11" fill="#9fe9ff">' + lastInt.v.toFixed(1) + '°C</text>';
    }

    svg.innerHTML = svgInner;

    try {
      var le = document.getElementById('legend-ext-value'); if (le) le.textContent = lastExt ? lastExt.v.toFixed(1) + '°C' : '--';
      var li = document.getElementById('legend-int-value'); if (li) li.textContent = lastInt ? lastInt.v.toFixed(1) + '°C' : '--';
    } catch(e) {}
  }

  var CONNECTION_MAP = {
    connecting: { cls: '',     label: 'Connexion en cours...' },
    ws:         { cls: 'ws',   label: 'WebSocket connecte'    },
    ajax:       { cls: 'ajax', label: 'Mode AJAX (fallback)'  },
    error:      { cls: 'err',  label: 'Hors ligne'            }
  };

  function renderConnection(status) {
    var info = CONNECTION_MAP[status] || { cls: '', label: '...' };
    var dot   = document.getElementById('conn-dot');
    var label = document.getElementById('conn-label');
    if (dot)   dot.className = 'status-dot ' + info.cls;
    if (label) label.textContent = info.label;
  }
  function showPopup(message) {
    var container = document.getElementById('alert-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'alert-container';
      document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.className = 'alert-toast';
    toast.innerHTML = '<strong>⚠️ Alerte Variation :</strong> ' + message;

    container.appendChild(toast);

    setTimeout(function() {
      toast.style.opacity = '0';
      setTimeout(function() { toast.remove(); }, 500);
    }, 5000);
  }

  return {
    renderSensor: renderSensor,
    renderConnection: renderConnection,
    renderHistory: renderHistory,
    showPopup: showPopup // <--- ICI
  };

  return {
    renderSensor:     renderSensor,
    renderConnection: renderConnection,
    renderHistory:    renderHistory
  };
  function renderAlertLog(alerts) {
    var container = document.getElementById('alerts-log');
    if (!container) return;

    if (alerts.length === 0) {
      container.innerHTML = '<p>Aucune alerte.</p>';
      return;
    }

    var html = '<table class="striped">';
    html += '<thead><tr><th>Heure</th><th>Capteur</th><th>Valeur</th><th>Problème</th></tr></thead><tbody>';

    alerts.forEach(function(a) {
      var time = new Date(a.ts).toLocaleTimeString('fr-FR');
      var label = (a.type === 'ext') ? 'Extérieur' : 'Intérieur';
      var color = (a.value < 10) ? '#4361ee' : '#ff4d1c'; // froid=bleu, chaud=rouge

      html += '<tr>';
      html += '<td>' + time + '</td>';
      html += '<td>' + label + '</td>';
      html += '<td style="color:' + color + '; font-weight:bold">' + a.value.toFixed(1) + '°C</td>';
      html += '<td>' + a.reason + '</td>';
      html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  var _unreadAlerts = 0;
  function updateAlertBadge(increment) {
    _unreadAlerts += increment;
    var badge = document.getElementById('alert-badge');
    if (badge) {
      badge.textContent = _unreadAlerts;
      badge.style.display = (_unreadAlerts > 0) ? 'inline-block' : 'none';
    }
  }

  function clearAlertBadge() {
    _unreadAlerts = 0;
    updateAlertBadge(0);
  }


})();
