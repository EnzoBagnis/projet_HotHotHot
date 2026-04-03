var Router = (function () {

  function show(pageId) {
    document.querySelectorAll('.page').forEach(function (el) {
      el.classList.remove('active');
    });

    var target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');

    document.querySelectorAll('nav.top-nav a[id^="nav-"]').forEach(function (a) {
      a.classList.remove('active');
      a.removeAttribute('aria-current');
    });

    var navLink = document.getElementById('nav-' + pageId);
    if (navLink) {
      navLink.classList.add('active');
      navLink.setAttribute('aria-current', 'page');
    }
  }

  function init() {
    var navHome = document.getElementById('nav-home');
    var navDoc  = document.getElementById('nav-doc');
    var brand   = document.getElementById('nav-brand');

    if (navHome)  navHome.addEventListener('click',  function (e) { e.preventDefault(); show('home'); });
    if (navDoc)   navDoc.addEventListener('click',   function (e) { e.preventDefault(); show('doc');  });
    if (brand)    brand.addEventListener('click',    function (e) { e.preventDefault(); show('home'); });
  }

  return {
    init: init,
    show: show
  };

})();
