var Tabs = (function () {

  function switchTo(name) {
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });

    document.querySelectorAll('.tab-panel').forEach(function (panel) {
      panel.classList.remove('active');
    });

    var btn   = document.getElementById('tbtn-' + name);
    var panel = document.getElementById('tab-'  + name);

    if (btn)   { btn.classList.add('active');   btn.setAttribute('aria-selected', 'true'); }
    if (panel) { panel.classList.add('active'); }
  }

  function init() {
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.id.replace('tbtn-', '');
        switchTo(name);
      });
    });
  }

  return {
    init:     init,
    switchTo: switchTo
  };

})();
