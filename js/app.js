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

});
