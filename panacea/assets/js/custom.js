/* ==========================================================================
   Farmacia Panacea — JS del tema hijo
   1) Botonera A-Z de marcas
   2) Vista rápida al hacer clic en la foto del producto
   3) Animación .pnc-fade-up
   Todo es opcional: si el marcado no existe, no hace nada.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. Filtro alfabético de marcas ---------- 
  function initAlpha() {
    var bar = document.querySelector('[data-pnc-alpha]');
    if (!bar) return;
    var scope = document.querySelector('[data-pnc-alpha-items]') || document;
    var items = Array.prototype.slice.call(scope.querySelectorAll('[data-pnc-brand]'));
    if (!items.length) {
      // Fallback: intenta leer el nombre desde el alt de la imagen o el texto del enlace
      items = Array.prototype.slice.call(scope.querySelectorAll('.pnc-brand-card'));
      items.forEach(function (el) {
        var img = el.querySelector('img');
        var name = (el.getAttribute('data-pnc-brand') || (img && img.alt) || el.textContent || '').trim();
        el.setAttribute('data-pnc-brand', name);
      });
    }

    function letterOf(el) {
      var n = (el.getAttribute('data-pnc-brand') || '').trim().toUpperCase();
      n = n.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      var c = n.charAt(0);
      return /[A-Z]/.test(c) ? c : '#';
    }

    var present = {};
    items.forEach(function (el) { present[letterOf(el)] = true; });

    bar.querySelectorAll('.pnc-alpha__btn').forEach(function (btn) {
      var l = (btn.dataset.letter || btn.textContent).trim().toUpperCase();
      if (l !== 'TODAS' && l !== '*' && !present[l]) btn.classList.add('is-empty');
    });

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.pnc-alpha__btn');
      if (!btn || btn.classList.contains('is-empty')) return;
      e.preventDefault();
      bar.querySelectorAll('.pnc-alpha__btn').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');

      var l = (btn.dataset.letter || btn.textContent).trim().toUpperCase();
      var all = (l === '*' || l === 'TODAS');
      var visible = 0;
      items.forEach(function (el) {
        var target = el.closest('[data-pnc-brand-cell]') || el;
        var show = all || letterOf(el) === l;
        target.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      var empty = document.querySelector('[data-pnc-alpha-empty]');
      if (empty) empty.style.display = visible ? 'none' : '';
    });
  }*/

  /* ---------- 2. Vista rápida al clicar la imagen ---------- */
  function ensureModal() {
    var m = document.getElementById('pnc-quickview');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'pnc-quickview';
    m.innerHTML =
      '<div class="pnc-qv__backdrop" data-pnc-qv-close></div>' +
      '<div class="pnc-qv__dialog" role="dialog" aria-modal="true" aria-label="Vista rápida del producto">' +
        '<button type="button" class="pnc-qv__close" data-pnc-qv-close aria-label="Cerrar">&times;</button>' +
        '<div class="pnc-qv__media"></div>' +
        '<div class="pnc-qv__body"></div>' +
      '</div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) { if (e.target.hasAttribute('data-pnc-qv-close')) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
    return m;
  }
  function closeModal() {
    var m = document.getElementById('pnc-quickview');
    if (m) { m.classList.remove('is-open'); document.body.style.overflow = ''; }
  }

  function initQuickView() {
    document.addEventListener('click', function (e) {
      var thumb = e.target.closest('.js-product-miniature .product-thumbnail, .product-miniature .product-thumbnail, .pnc-quickview-trigger');
      if (!thumb) return;
      var card = thumb.closest('.js-product-miniature, .product-miniature, [data-id-product]');
      if (!card) return;
      var id = card.getAttribute('data-id-product');
      if (!id) return; // sin id, deja el enlace normal
      e.preventDefault();

      var m = ensureModal();
      var img = thumb.querySelector('img');
      m.querySelector('.pnc-qv__media').innerHTML = img ? '<img src="' + (img.dataset.fullSrc || img.src) + '" alt="' + (img.alt || '') + '">' : '';
      m.querySelector('.pnc-qv__body').innerHTML = '<p class="pnc-text-muted">Cargando…</p>';
      m.classList.add('is-open');
      document.body.style.overflow = 'hidden';

      var url = (window.prestashop && prestashop.urls && prestashop.urls.pages.product)
        ? null : null;
      var link = card.querySelector('a[href]');
      var href = link ? link.href : null;
      if (!href) return;

      fetch(href + (href.indexOf('?') > -1 ? '&' : '?') + 'quickview=1', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(function (r) { return r.text(); })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var title = doc.querySelector('h1');
          var price = doc.querySelector('.current-price, .product-price');
          var desc  = doc.querySelector('#product-description-short, .product-description-short');
          m.querySelector('.pnc-qv__body').innerHTML =
            '<h3 class="pnc-h-3">' + (title ? title.textContent.trim() : '') + '</h3>' +
            '<p class="product-prices" style="font-size:var(--pnc-fs-h3);font-weight:600;color:var(--pnc-green-dark)">' + (price ? price.textContent.trim() : '') + '</p>' +
            '<div class="pnc-text-muted">' + (desc ? desc.innerHTML : '') + '</div>' +
            '<p style="margin-top:24px"><a class="btn btn-primary" href="' + href + '">Ver ficha completa</a></p>';
        })
        .catch(function () { window.location.href = href; });
    });
  }

  /* ---------- 3. Aparición suave ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.pnc-fade-up');
    if (!els.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }


  function boot() { initQuickView(); initReveal(); }
  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);

  // Re-inicializa tras las actualizaciones AJAX de PrestaShop
  if (window.prestashop && typeof prestashop.on === 'function') {
    prestashop.on('updatedProductList', function () { initReveal(); });
  }
})();