/* ==========================================================================
   Farmacia Panacea — Menú hamburguesa (tablet/móvil)
   Completa el widget Menú de Creative Elements (clase "pnc-hdr-burger"):
     - fondo semitransparente sobre la página mientras está abierto
     - se cierra al tocar el fondo, con Escape o al pasar a escritorio
     - bloquea el scroll de la página mientras está abierto
   No abre ni cierra el menú por su cuenta: usa el propio botón de
   Creative Elements, así la ✕ y sus animaciones siguen funcionando igual.
   ========================================================================== */
(function () {
  'use strict';

  var OPEN_CLASS = 'pnc-menu-open';
  var DESKTOP = window.matchMedia('(min-width: 1025px)');

  function init() {
    var toggle = document.querySelector('.pnc-hdr-burger .elementor-menu-toggle');
    if (!toggle) {
      return;
    }

    var backdrop = document.createElement('div');
    backdrop.className = 'pnc-menu-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);

    function isOpen() {
      return toggle.classList.contains('elementor-active');
    }

    function sync() {
      document.body.classList.toggle(OPEN_CLASS, isOpen() && !DESKTOP.matches);
    }

    function close(returnFocus) {
      if (isOpen()) {
        toggle.click();
        if (returnFocus) {
          toggle.focus();
        }
      }
    }

    // Creative Elements cambia la clase del botón al abrir y cerrar
    new MutationObserver(sync).observe(toggle, {
      attributes: true,
      attributeFilter: ['class']
    });

    backdrop.addEventListener('click', function () {
      close(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        close(true);
      }
    });

    // Al pasar a escritorio (girar la tablet, agrandar la ventana) se cierra
    var onChange = function () {
      if (DESKTOP.matches) {
        close(false);
      }
      sync();
    };
    if (DESKTOP.addEventListener) {
      DESKTOP.addEventListener('change', onChange);
    } else {
      DESKTOP.addListener(onChange);
    }

    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
