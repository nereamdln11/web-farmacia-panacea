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

/* ==========================================================================
   Alto entero del header fijo (Safari en iPad)
   La suma de las filas del header da un alto con decimales (p. ej. 153,19px
   por el borde de 0,75px y los altos de línea). Safari, al dejar el header
   fijo arriba (position: sticky), pinta en ese caso una línea negra de 1px
   en el borde inferior: no es un borde CSS, es un fallo de composición.
   Redondeando el alto hacia arriba a un número entero desaparece.
   ========================================================================== */
(function () {
  'use strict';
  var header = document.querySelector('header.header');
  var content = header && header.firstElementChild;   // contenido del header
  if (!header || !content || !window.ResizeObserver) {
    return;
  }
  // Se mide el contenido (no el header, cuyo alto es el que se toca) para
  // no entrar en bucle y para seguir los cambios de alto reales (por
  // ejemplo, el buscador que se recoge en móvil).
  function roundHeight() {
    var cs = window.getComputedStyle(header);
    var h = content.getBoundingClientRect().height +
            parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) +
            parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    header.style.height = Math.ceil(h - 0.01) + 'px';
  }
  new ResizeObserver(function () {
    window.requestAnimationFrame(roundHeight);
  }).observe(content);
  roundHeight();
})();
