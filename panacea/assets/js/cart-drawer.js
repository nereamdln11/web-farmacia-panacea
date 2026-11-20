/* ==========================================================================
   Farmacia Panacea — Carrito desplegable (panel lateral)
   Completa el widget "Carrito" de Creative Elements (header) con lo del
   diseño de Lovable (CartDrawer.tsx):
   - Contador de artículos junto a "Mi carrito".
   - Barra de envío gratis (49 €).
   - En cada producto: marca, selector de cantidad (− cantidad +), precio
     de la línea y, si hay descuento, precio original tachado y −%.
   - Línea "Pago seguro · Recogida en farmacia" bajo los botones.
   - Carrito vacío: mete dentro del panel la sección de Creative Elements
     con la clase "pnc-cart-empty" (categorías, promociones, recomendados).
   Creative Elements vuelve a pintar el panel en cada cambio del carrito
   (evento updateCart de PrestaShop), así que todo esto se rehace después.
   Los botones − / + usan las mismas URL de PrestaShop que la página del
   carrito, y avisan con updateCart para que todo se actualice.
   En Creative Elements: widget Carrito con "Add to Cart Action: Abrir
   carrito de compras".
   ========================================================================== */
(function () {
  'use strict';

  var FREE_SHIPPING = 49;          // € — envío gratis a partir de aquí
  var SHOW_SHIPPING_BAR = true;    // false: oculta la barra (p. ej. solo recogida)
  var NOTE = 'Pago seguro · Recogida en farmacia';

  var money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

  var ICONS = {
    minus: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5v14"/></svg>',
    truck: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
    shield: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>'
  };

  function el(tag, cls, html) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    if (html) { node.innerHTML = html; }
    return node;
  }

  function init() {
    var widget = document.querySelector('.elementor-widget-shopping-cart');
    var main = widget && widget.querySelector('.elementor-cart__main');
    if (!main || !window.prestashop) {
      return;
    }
    var title = main.querySelector('.elementor-cart__title');
    var close = main.querySelector('.elementor-cart__close-button');
    var products = main.querySelector('.elementor-cart__products');
    var footer = main.querySelector('.elementor-cart__footer-buttons');
    if (!title || !products) {
      return;
    }

    // Cabecera: "Mi carrito" + contador + ✕ en una fila
    var head = el('div', 'pnc-cart-head');
    var count = el('span', 'pnc-cart-count');
    count.setAttribute('aria-live', 'polite');
    main.insertBefore(head, main.firstChild);
    head.appendChild(title);
    head.appendChild(count);
    if (close) { head.appendChild(close); }

    // Barra de envío gratis
    var ship = el('div', 'pnc-cart-ship',
      '<p class="pnc-cart-ship__text" aria-live="polite">' + ICONS.truck + '<span></span></p>' +
      '<div class="pnc-cart-ship__track" role="progressbar" aria-label="Progreso para envío gratis" aria-valuemin="0" aria-valuemax="100">' +
      '<div class="pnc-cart-ship__bar"></div></div>');
    ship.hidden = !SHOW_SHIPPING_BAR;
    main.insertBefore(ship, products);
    var shipText = ship.querySelector('.pnc-cart-ship__text span');
    var shipTrack = ship.querySelector('.pnc-cart-ship__track');
    var shipBar = ship.querySelector('.pnc-cart-ship__bar');

    // Carrito vacío: la sección de Creative Elements pasa dentro del panel
    var empty = document.querySelector('.pnc-cart-empty');
    if (empty) {
      main.insertBefore(empty, products.nextSibling);
    }

    // "Pago seguro · Recogida en farmacia"
    if (footer) {
      footer.parentNode.insertBefore(el('p', 'pnc-cart-note', ICONS.shield + '<span>' + NOTE + '</span>'), footer.nextSibling);
    }

    var cart = window.prestashop.cart || null;
    var pending = false;

    function render() {
      pending = false;
      if (!cart) {
        return;
      }
      var n = +cart.products_count || 0;
      main.classList.toggle('pnc-cart--empty', n === 0);
      count.textContent = n + (n === 1 ? ' artículo' : ' artículos');

      // Envío gratis: sobre el subtotal de productos
      var subtotal = cart.subtotals && cart.subtotals.products ? +cart.subtotals.products.amount : 0;
      var remaining = Math.max(0, Math.round((FREE_SHIPPING - subtotal) * 100) / 100);
      var progress = Math.min(100, subtotal / FREE_SHIPPING * 100);
      shipText.textContent = remaining > 0
        ? 'Te faltan ' + money.format(remaining) + ' para el envío gratis'
        : '¡Tienes el envío gratis!';
      shipBar.style.width = progress + '%';
      shipTrack.setAttribute('aria-valuenow', Math.round(progress));

      // Resumen: "Subtotal" y "Envío" como en Lovable
      var labels = main.querySelectorAll('.elementor-cart__summary-label');
      if (labels[0]) { labels[0].textContent = 'Subtotal'; }
      Array.prototype.forEach.call(labels, function (label) {
        if (/^\s*Transporte\s*$/i.test(label.textContent)) { label.textContent = 'Envío'; }
      });

      // Productos (mismo orden que cart.products)
      var rows = products.querySelectorAll('.elementor-cart__product');
      var list = cart.products || [];
      Array.prototype.forEach.call(rows, function (row, i) {
        if (list[i]) { enhanceRow(row, list[i]); }
      });
    }

    function schedule() {
      if (!pending) {
        pending = true;
        window.requestAnimationFrame(render);
      }
    }

    function enhanceRow(row, p) {
      if (row.classList.contains('pnc-cart-row')) {
        return;
      }
      row.classList.add('pnc-cart-row');
      row.removeAttribute('inert');
      var info = row.querySelector('.elementor-cart__product-name');
      var price = row.querySelector('.elementor-cart__product-price');
      if (!info || !price) {
        return;
      }
      var name = p.name || '';

      if (p.manufacturer_name) {
        var brand = el('div', 'pnc-cart-brand');
        brand.textContent = p.manufacturer_name;
        info.insertBefore(brand, info.firstChild);
      }

      var qty = +p.quantity || 1;
      var line = el('div', 'pnc-cart-line');

      var group = el('div', 'pnc-qty');
      var down = el('button', 'pnc-qty__btn', ICONS.minus);
      down.type = 'button';
      down.dataset.url = p.down_quantity_url || '';
      down.setAttribute('aria-label', 'Reducir cantidad de ' + name);
      down.disabled = qty <= 1 || !p.down_quantity_url;
      var value = el('span', 'pnc-qty__value elementor-cart__product-quantity');
      value.textContent = qty;
      var up = el('button', 'pnc-qty__btn', ICONS.plus);
      up.type = 'button';
      up.dataset.url = p.up_quantity_url || '';
      up.setAttribute('aria-label', 'Aumentar cantidad de ' + name);
      up.disabled = !p.up_quantity_url;
      [down, up].forEach(function (b) {
        b.dataset.idProduct = p.id_product;
        b.dataset.idProductAttribute = p.id_product_attribute;
        b.dataset.idCustomization = p.id_customization || 0;
      });
      group.appendChild(down);
      group.appendChild(value);
      group.appendChild(up);

      var prices = el('div', 'pnc-cart-prices');
      var now = el('span', 'pnc-cart-price');
      now.innerHTML = '<span class="visually-hidden">Precio actual: </span>';
      now.appendChild(document.createTextNode(p.is_gift ? 'Regalo' : (p.total || p.price)));
      prices.appendChild(now);
      if (p.has_discount && !p.is_gift && p.regular_price_amount) {
        var was = el('div', 'pnc-cart-was');
        var del = el('del');
        del.innerHTML = '<span class="visually-hidden">Precio original: </span>';
        del.appendChild(document.createTextNode(money.format(p.regular_price_amount * qty)));
        was.appendChild(del);
        var off = p.discount_type === 'percentage' ? p.discount_percentage_absolute : p.discount_to_display;
        if (off) {
          var pill = el('span', 'pnc-cart-off');
          pill.textContent = '−' + String(off).replace(/^[-−]/, '');
          pill.setAttribute('aria-label', 'Descuento de ' + String(off).replace(/^[-−]/, ''));
          was.appendChild(pill);
        }
        prices.appendChild(was);
      }

      line.appendChild(group);
      line.appendChild(prices);
      price.innerHTML = '';
      price.appendChild(line);
      info.appendChild(price);
    }

    // − / +: mismas URL que la página del carrito
    main.addEventListener('click', function (event) {
      var btn = event.target.closest('.pnc-qty__btn');
      if (!btn || btn.disabled || !btn.dataset.url) {
        return;
      }
      event.preventDefault();
      var row = btn.closest('.elementor-cart__product');
      var reason = {
        idProduct: btn.dataset.idProduct,
        idProductAttribute: btn.dataset.idProductAttribute,
        idCustomization: btn.dataset.idCustomization,
        linkAction: 'update-quantity'
      };
      row.setAttribute('inert', '');
      row.setAttribute('aria-disabled', 'true');
      window.jQuery.ajax({
        url: btn.dataset.url,
        method: 'POST',
        dataType: 'json',
        data: { ajax: 1, action: 'update' }
      }).then(function (resp) {
        window.prestashop.emit('updateCart', { reason: reason, resp: resp });
      }).fail(function (resp) {
        row.removeAttribute('inert');
        row.removeAttribute('aria-disabled');
        window.prestashop.emit('handleError', { eventType: 'updateProductInCart', resp: resp, cartAction: reason.linkAction });
      });
    });

    window.prestashop.on('updateCart', function (data) {
      if (data && data.resp && data.resp.cart) {
        cart = data.resp.cart;
        schedule();
      }
    });
    // Creative Elements repinta las filas: se vuelven a completar
    new MutationObserver(schedule).observe(products, { childList: true });
    new MutationObserver(schedule).observe(main.querySelector('.elementor-cart__summary') || main, { childList: true });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
