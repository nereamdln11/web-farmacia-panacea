(function () {
  'use strict';

  var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Rellena aquí las líneas de cada marca según vayas cerrando sus imports.
  // La clave debe coincidir con el resultado de normalize() sobre el nombre de la marca.
  var BRAND_LINES = {
    'isdin': [
      'ISDIN Fotoprotetcor', 'ISDINCEUTICS', 'Ureadin', 'Bexident', 'ISDIN BABYNATURALS',
      'Germisdin', 'Acniben', 'ISDIN Woman', 'ISDIN Lambdapil', 'ISDIN Lambda Control',
      'ISDIN Nutratopic', 'ISDIN Reparador Labial', 'Psorisdin', 'ISDIN Coverage',
      'ISDIN Nutradeica', 'ISDIN Medicis', 'ISDIN Post Solar', 'ISDIN Avena', 'Daylisdin',
      'ISDIN Nutracel', 'ISDIN Antipiojos', 'ISDIN Si-Nails', 'ISDIN Zincation',
      'ISDIN Cicapost', 'ISDIN DEO'
    ],
    'la roche-posay': [],
    'avene': [],
    'bioderma': [],
    'eucerin': []
  };

  function normalize(str) {
    return (str || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function init() {
    var grid = document.querySelector('#grid-brands-filter .ce-articles');
    if (!grid) return;

    // 1. Localiza los ítems que pinta Creative Elements.
    var items = grid.querySelectorAll('.ce-article');
    if (!items.length) return;

    // 2. Construye el índice leyendo el DOM (nombre + líneas asociadas para la búsqueda).
    var brands = Array.prototype.map.call(items, function (el) {
      var img  = el.querySelector('img');
      var name = (el.querySelector('.ce-article__title') || {}).textContent ||
                 (img && img.getAttribute('alt')) || '';
      name = name.replace(/\s+/g, ' ').trim();
      var norm = normalize(name);
      var lines = BRAND_LINES[norm] || [];
      var searchable = norm + ' ' + lines.map(normalize).join(' ');
      return {
        el: el,
        name: name,
        norm: searchable,        // nombre + líneas normalizados, usado por la búsqueda
        letter: (norm.charAt(0) || '').toUpperCase(), // solo del nombre, para el filtro A-Z
        lines: lines,
        linesWrap: null
      };
    }).filter(function (b) { return b.name.length > 0; });

    // 2b. Crea el contenedor de chips una sola vez por marca (se rellena en cada apply()).
    brands.forEach(function (b) {
      if (!b.lines.length) return;
      var text = b.el.querySelector('.ce-article__text');
      if (!text) return;
      var wrap = document.createElement('div');
      wrap.className = 'pnc-article-lines';
      text.appendChild(wrap);
      b.linesWrap = wrap;
    });

    var available = {};
    brands.forEach(function (b) { available[b.letter] = true; });

    // 3. Pinta el abecedario.
    var alpha = document.querySelector('.pnc-brands-alpha');
    if (!alpha) return;
    LETTERS.forEach(function (L) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pnc-alpha';
      btn.setAttribute('data-letter', L);
      btn.textContent = L;
      if (!available[L]) {
        btn.disabled = true;
        btn.classList.add('is-disabled');
        btn.setAttribute('aria-disabled', 'true');
      }
      alpha.appendChild(btn);
    });

    var input   = document.querySelector('#pnc-brand-search');
    var empty   = document.querySelector('.pnc-brands-empty');
    var counter = document.querySelector('.pnc-brands-count');
    var reset   = document.querySelector('.pnc-brands-reset');
    if (!input) return;

    var state = { query: '', letter: '' };
    function slugifyLine(line) {
        return line.trim().replace(/\s+/g, '-');
    }
    // Decide qué 3 líneas mostrar en la tarjeta de una marca.
    function renderBrandLines(b, query) {
        if (!b.linesWrap || !b.lines.length) return;
        var wrap = b.linesWrap;
        wrap.innerHTML = '';

        var brandLink = b.el.querySelector('.ce-article__thumbnail') || b.el.querySelector('a');
        var brandHref = brandLink ? brandLink.getAttribute('href') : '#';

        var alphaLines = b.lines.slice().sort(function (a, c) { return a.localeCompare(c, 'es'); });
        var matchedLine = null;

        if (query) {
            var q = normalize(query);
            matchedLine = b.lines.filter(function (l) { return normalize(l).indexOf(q) !== -1; })[0] || null;
        }

        var display;
        if (matchedLine) {
            var rest = alphaLines.filter(function (l) { return l !== matchedLine; });
            display = [matchedLine].concat(rest.slice(0, 2));
        } else {
            display = alphaLines.slice(0, 3);
        }

        display.forEach(function (line) {
            var chip = document.createElement('a');
            chip.className = 'pnc-line-chip';
            chip.href = brandHref + '?q=linea-' + slugifyLine(line);
            if (line === matchedLine) chip.classList.add('is-match');
            chip.textContent = line;
            wrap.appendChild(chip);
        });

        var remaining = b.lines.length - display.length;
        if (remaining > 0) {
            var more = document.createElement('a');
            more.className = 'pnc-line-more';
            more.href = brandHref;
            more.textContent = '+' + remaining + (remaining === 1 ? ' línea más' : ' líneas más');
            wrap.appendChild(more);
        }
    }

    function apply() {
      var q = normalize(state.query);
      var visible = 0;

      brands.forEach(function (b) {
        var okQuery  = !q || b.norm.indexOf(q) !== -1;
        var okLetter = !state.letter || b.letter === state.letter;
        var show = okQuery && okLetter;
        b.el.classList.toggle('is-hidden', !show);
        b.el.hidden = !show;
        if (show) {
          visible++;
          renderBrandLines(b, state.query);
        }
      });

      grid.classList.toggle('is-empty', visible === 0);
      if (empty) empty.hidden = visible !== 0;
      if (counter) {
        counter.textContent = visible === 0
          ? ''
          : visible + (visible === 1 ? ' marca' : ' marcas');
      }
    }

    // Búsqueda con debounce
    var timer;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      var value = input.value;
      timer = setTimeout(function () { state.query = value; apply(); }, 120);
    });
    input.addEventListener('search', function () { state.query = input.value; apply(); });

    // Filtro alfabético
    alpha.addEventListener('click', function (e) {
      var btn = e.target.closest('.pnc-alpha');
      if (!btn || btn.disabled) return;
      state.letter = btn.getAttribute('data-letter') || '';
      alpha.querySelectorAll('.pnc-alpha').forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
      });
      apply();
      if (btn.scrollIntoView) {
        btn.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
    });

    // Reset completo
    if (reset) {
      reset.addEventListener('click', function () {
        state.query = ''; state.letter = '';
        input.value = '';
        alpha.querySelectorAll('.pnc-alpha').forEach(function (b) {
          b.classList.toggle('is-active', b.getAttribute('data-letter') === '');
        });
        apply();
        input.focus();
      });
    }

    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();