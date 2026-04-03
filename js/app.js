document.addEventListener('DOMContentLoaded', function () {

  Model.on('sensor:updated', function (data) {
    View.renderSensor(data.type, data.sensor);
    try {
      var extH = Model.getHistory('ext');
      var intH = Model.getHistory('int');
      View.renderHistory(extH, intH);
    } catch (e) { }
  });

  Model.on('connection:changed', function (data) {
    View.renderConnection(data.status);
  });

  Router.init();
  Tabs.init();

  var historyBtn = document.getElementById('tbtn-history');
  if (historyBtn) {
    historyBtn.addEventListener('click', function () {
      try {
        var extH = Model.getHistory('ext');
        var intH = Model.getHistory('int');
        View.renderHistory(extH, intH);
      } catch (e) {}
    });
  }

  WSController.init();

  Model.on('sensor:alert', function (data) {
    var label = (data.type === 'ext') ? 'Extérieur' : 'Intérieur';
    View.showPopup(label + " : " + data.value.toFixed(1) + "°C - " + data.reason);

    View.updateAlertBadge(1);
    View.renderAlertLog(Model.getAlerts());
  });

  document.getElementById('tbtn-alerts').addEventListener('click', function() {
    View.renderAlertLog(Model.getAlerts());
  });
  document.addEventListener('DOMContentLoaded', function () {

    Model.on('sensor:updated', function (data) {
      View.renderSensor(data.type, data.sensor);
    });

    Model.on('sensor:alert', function (data) {
      View.showPopup(data.reason);
      View.updateAlertBadge(1);
      View.renderAlertLog(Model.getAlerts());
    });

    Model.on('connection:changed', function (data) {
      View.renderConnection(data.status);
    });

    Router.init();
    Tabs.init();
    WSController.init();
  });

});

