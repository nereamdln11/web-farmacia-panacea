
/**
 * El buscador del header lo pinta el widget "AJAX Search" de Creative
 * Elements (modules/creativeelements/views/js/frontend.js), que registra un
 * jQuery UI Autocomplete con nombre propio:
 *   $.widget('ww.ceAjaxSearch', $.ui.autocomplete, {...})
 * Al ser un widget con nombre nuevo, jQuery UI usa ese nombre como
 * widgetEventPrefix (jquery-ui.js), así que los eventos NO son
 * 'autocompleteresponse'/'autocompleteopen' sino 'ceajaxsearchresponse'/
 * 'ceajaxsearchopen'. El input sí conserva la clase genérica
 * 'ui-autocomplete-input' (la añade el _create() base heredado), pero el
 * markup propio del widget usa '.elementor-search__input'.
 */
(function ($) {
  $(document).on('ceajaxsearchresponse', '.elementor-search__input', function (event, ui) {
    var $input = $(this);
    var term = $input.val().trim();
    var $wrap = $input.closest('.elementor-search');
    var $noResults = $wrap.find('.pnc-search-no-results');

    if (!$noResults.length) {
      $noResults = $('<div class="pnc-search-no-results"></div>').appendTo($wrap);
    }

    if (!ui.content || ui.content.length === 0) {
      $noResults.text('No hay resultados para "' + term + '"').addClass('is-visible');
    } else {
      $noResults.removeClass('is-visible');
    }
  });

  // El widget solo tiene un sitio donde oculta el <ul> de resultados:
  // _close(), que se llama en Escape, clic fuera, blur y cuando el término
  // baja del mínimo de caracteres. Nos enganchamos también a ese cierre
  // para que el aviso de "sin resultados" se oculte en los mismos casos
  // y no se quede pegado en pantalla cuando el desplegable ya se cerró.
  $(document).on('ceajaxsearchclose', '.elementor-search__input', function () {
    $(this).closest('.elementor-search').find('.pnc-search-no-results').removeClass('is-visible');
  });

  // _close() solo dispara ese evento si el <ul> de resultados ESTABA
  // visible. Con 0 resultados el <ul> nunca llega a abrirse (__response lo
  // cierra directamente), así que al borrar el término no hay transición
  // visible→oculto que dispare 'ceajaxsearchclose'. Por eso comprobamos
  // directamente en cada tecla (y en el botón de limpiar, que dispara un
  // 'keydown' sintético con el valor ya vacío) si queda por debajo del
  // mínimo de caracteres, y si es así ocultamos el aviso nosotros mismos.
  $(document).on('keydown input', '.elementor-search__input', function () {
    var $input = $(this);
    var minLength = parseInt($input.attr('minlength'), 10) || 0;

    if ($input.val().trim().length < minLength) {
      $input.closest('.elementor-search').find('.pnc-search-no-results').removeClass('is-visible');
    }
  });

  $(document).on('ceajaxsearchopen', '.elementor-search__input', function () {
    var $input = $(this);
    var term = $input.val().trim();
    var $wrap = $input.closest('.elementor-search');
    var $menu = $wrap.find('.elementor-search__products');

    $wrap.find('.pnc-search-no-results').removeClass('is-visible');
    $menu.find('.pnc-search-view-all').remove();

    var $item = $('<li class="pnc-search-view-all" role="presentation"></li>');
    var $btn = $('<button type="button" class="pnc-search-view-all__btn"></button>')
      .text('Ver todos los resultados para “' + term + '”')
      .on('click', function () {
        window.location.href = '/busqueda?s=' + encodeURIComponent(term);
      });

    $item.append($btn);
    $menu.append($item);
  });
})(jQuery);
