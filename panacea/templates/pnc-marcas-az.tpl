{* Snippet HTML de la botonera A-Z.
   Pégalo en un widget HTML de Creative Elements en la página de marcas,
   justo encima de la rejilla de marcas. *}
<div class="pnc-alpha" data-pnc-alpha>
  <button type="button" class="pnc-alpha__btn is-active" data-letter="*">Todas</button>
  {foreach from=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'] item=l}
    <button type="button" class="pnc-alpha__btn" data-letter="{$l}">{$l}</button>
  {/foreach}
</div>
<p data-pnc-alpha-empty style="display:none;text-align:center;color:var(--pnc-grey)">No hay marcas con esa letra.</p>
