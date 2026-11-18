/* ==========================================================================
   Farmacia Panacea — Buscador plegable en móvil (≤767px; en tablet va en la fila de iconos)
   - Arriba de la página el buscador se ve siempre.
   - Al bajar, se recoge y queda una lupa en la fila de iconos.
   - La lupa lo abre (con el teclado) y lo cierra.
   - Se cierra al tocar fuera, con Escape o al seguir bajando, salvo si
     se está escribiendo (foco en el campo) o el campo tiene texto.
   - Abrir el buscador cierra el menú hamburguesa, y abrir el menú
     recoge el buscador.
   - En móvil se oculta el icono de usuario ("Mi cuenta" está en
     la hamburguesa).
   En Creative Elements: widget Icono (lupa) en la fila principal con las
   clases "pnc-hdr-icon pnc-hdr-search-toggle", sin "Ocultar en…".
   En escritorio no hace nada: el CSS oculta la lupa.
   ========================================================================== */
(function () {
  'use strict';

  var MOBILE = window.matchMedia('(max-width: 767px)');
  var TOP_ZONE = 10;       // px: "arriba de la página"
  var COLLAPSE_AT = 80;    // px: a partir de aquí, bajar recoge el buscador

  function init() {
    var header = document.querySelector('header.header');
    var search = document.querySelector('.pnc-hdr-main .pnc-hdr-search');
    if (!header || !search) {
      return;
    }
    var input = search.querySelector('input[type="search"], input[name="s"], input');

    // Icono de usuario → se marca para ocultarlo en móvil y sirve de molde
    var account = Array.prototype.find.call(
      document.querySelectorAll('.pnc-hdr-main .pnc-hdr-icon'),
      function (w) {
        if (w.classList.contains('pnc-hdr-search-toggle')) {
          return false;                  // la lupa nunca es el icono de usuario
        }
        var a = w.querySelector('a[href]');
        return a && /mi-cuenta|my-account|login|identidad/.test(a.getAttribute('href'));
      }
    );
    if (account) {
      account.classList.add('pnc-hdr-account');
    }

    // Lupa: widget Icono de Creative Elements con la clase
    // "pnc-hdr-search-toggle" (se añade en el editor; clonarlo por JS
    // perdía los estilos por ID de Creative Elements y rompía la fila)
    var toggleWidget = document.querySelector('.pnc-hdr-main .pnc-hdr-search-toggle');
    if (!toggleWidget) {
      return;
    }
    var toggle = toggleWidget.querySelector('a, .elementor-icon') || toggleWidget;
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('aria-label', 'Buscar');
    if (toggle.tagName === 'A') {
      toggle.setAttribute('href', '#');
    } else {
      // Sin enlace en el editor, Creative Elements pinta un <span>:
      // se hace accesible con teclado como un botón
      toggle.setAttribute('tabindex', '0');
      toggle.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle.click();
        }
      });
    }
    search.id = search.id || 'pnc-ajax-search';
    toggle.setAttribute('aria-controls', search.id);

    var burgerToggle = document.querySelector('.pnc-hdr-burger .elementor-menu-toggle');

    var lastY = window.scrollY;

    function isCollapsed() {
      return header.classList.contains('pnc-search-collapsed');
    }
    function isBusy() {
      return document.activeElement === input || (input && input.value.trim() !== '');
    }
    function setCollapsed(collapsed) {
      header.classList.toggle('pnc-search-collapsed', collapsed);
      toggle.setAttribute('aria-expanded', String(!collapsed));
    }
    function open(focus) {
      setCollapsed(false);
      if (burgerToggle && burgerToggle.classList.contains('elementor-active')) {
        burgerToggle.click();
      }
      // El foco va en el mismo gesto del usuario para que iOS abra el teclado
      if (focus && input) {
        input.focus();
      }
    }
    function collapse() {
      if (window.scrollY <= TOP_ZONE) {
        return;                          // arriba de la página se ve siempre
      }
      if (input && document.activeElement === input) {
        input.blur();
      }
      setCollapsed(true);
    }

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      if (isCollapsed()) {
        open(true);
      } else if (window.scrollY > TOP_ZONE) {
        collapse();
      } else if (input) {
        input.focus();                   // arriba: la lupa solo enfoca
      }
    });

    window.addEventListener('scroll', function () {
      if (!MOBILE.matches) {
        return;
      }
      var y = window.scrollY;
      if (y <= TOP_ZONE) {
        setCollapsed(false);
      } else if (y > lastY && y > COLLAPSE_AT && !isCollapsed() && !isBusy()) {
        setCollapsed(true);
      }
      lastY = y;
    }, { passive: true });

    document.addEventListener('pointerdown', function (e) {
      if (!MOBILE.matches || isCollapsed()) {
        return;
      }
      if (search.contains(e.target) || toggleWidget.contains(e.target)) {
        return;
      }
      // Los resultados del buscador pueden pintarse fuera del widget
      if (e.target.closest && e.target.closest('.elementor-search__products, .ui-autocomplete, [class*="search__results"]')) {
        return;
      }
      if (!(input && input.value.trim() !== '')) {
        collapse();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && MOBILE.matches && !isCollapsed()) {
        collapse();
        toggle.focus();
      }
    });

    // Abrir el menú hamburguesa recoge el buscador
    if (burgerToggle) {
      new MutationObserver(function () {
        if (burgerToggle.classList.contains('elementor-active') && MOBILE.matches) {
          collapse();
        }
      }).observe(burgerToggle, { attributes: true, attributeFilter: ['class'] });
    }

    // Al pasar a escritorio, el buscador vuelve a su sitio
    var onChange = function () {
      if (!MOBILE.matches) {
        setCollapsed(false);
      }
    };
    if (MOBILE.addEventListener) {
      MOBILE.addEventListener('change', onChange);
    } else {
      MOBILE.addListener(onChange);
    }

    setCollapsed(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
