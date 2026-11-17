(function () {
    'use strict';

    function initMegaMenu() {

        const mega = document.querySelector('#main-megamenu-fixed');
        const buttons = document.querySelectorAll('#id-btn-category');

        if (!mega) {
            return;
        }

        if (!buttons.length) {
            return;
        }

        /*
         * =====================================================
         * ABRIR / CERRAR MEGAMENÚ
         * =====================================================
         */

        let overButton = false;
        let overMega = false;

        function updateVisibility() {

            if (overButton || overMega) {
                mega.classList.add('megamenu-visible');
            } else {
                mega.classList.remove('megamenu-visible');
            }

        }

        buttons.forEach(function (button) {

            button.addEventListener('mouseenter', function () {
                overButton = true;
                updateVisibility();
            });

            button.addEventListener('mouseleave', function () {
                overButton = false;
                setTimeout(updateVisibility, 50);
            });

        });

        mega.addEventListener('mouseenter', function () {
            overMega = true;
            updateVisibility();
        });

        mega.addEventListener('mouseleave', function () {
            overMega = false;
            updateVisibility();
        });


        /*
         * =====================================================
         * SUBCATEGORÍAS
         * =====================================================
         */

        const leftMenu =
            mega.querySelector(
                '.elementor-widget-category-list#ce-menu-left'
            ) ||
            mega.querySelector('#ce-menu-left');

        if (!leftMenu) {
            return;
        }


        /*
         * SOLO categorías principales.
         */
        const categories = Array.from(
            leftMenu.querySelectorAll(
                '.elementor-widget-container > ul > li > a'
            )
        ).filter(function (link) {
            return /\/\d+-/.test(link.href);
        });


        /*
         * Todos los bloques de subcategorías.
         */
        const subcategories =
            document.querySelectorAll('[id^="ce-sub-"]');
        const subcategories_label = document.querySelector('#megamenu-subcategory-label');
        const subcategories_link = document.querySelector('#megamenu-subcategory-link');
            /*
         * Todos los bloques de subcategorías.
         */
        const featured_offers =
            document.querySelectorAll('[id^="ce-cta-"]');


        /*
         * Ocultar todas inicialmente.
         */
        subcategories.forEach(function (block) {
            block.style.display = 'none';
            block.classList.remove('panacea-submenu-active');
        });


        /*
         * Obtener ID de categoría.
         *
         * /10-cosmetica-y-belleza
         * → 10
         */
        function getCategoryId(link) {

            const match =
                link.href.match(/\/(\d+)-/);

            return match ? match[1] : null;

        }


        /*
         * Mostrar subcategorías correspondientes.
         */
        function showSubcategories(link) {

            const categoryId =
                getCategoryId(link);
            const categoryName =
                link.querySelector('.elementor-icon-list-text')?.textContent.trim();

            const categoryUrl = link.href;
            // TÍTULO
            /*const headingLink = document.querySelector(
                '#megamenu-subcategory-label .elementor-heading-title a'
            );*/

            if (subcategories_label) {
                subcategories_label.textContent = 'EN ' + categoryName.toUpperCase();
                subcategories_label.href = categoryUrl;
            }

            // BOTÓN "VER TODO"
            /*const button = document.querySelector(
                '#megamenu-subcategory-label .elementor-button-link'
            );*/

            if (subcategories_link) {
                const buttonText = subcategories_link.querySelector('.elementor-button-text');
                const buttonUrl = subcategories_link.querySelector('.elementor-button-link');

                if (buttonText) {
                    buttonText.textContent = 'Ver todo en ' + categoryName;
                }
                if (buttonUrl) {
                    buttonUrl.href = categoryUrl;
                }
            }

            if (!categoryId) {
                return;
            }


            /*
             * Ocultar todas.
             */
            subcategories.forEach(function (block) {
                block.style.display = 'none';
            });

            featured_offers.forEach(function (block) {
                block.style.display = 'none';
            });
            /*
             * Mostrar la correspondiente.
             */
            const current =
                document.getElementById(
                    'ce-sub-' + categoryId
                );
            
            if (current) {

                current.style.display = '';
                current.style.height = 'auto';
                current.style.minHeight = '0';
                current.style.marginTop = '0';
                current.style.marginBottom = '0';

                void current.offsetWidth;

                current.classList.add('panacea-submenu-active');



            }
            const currentCta =
                document.getElementById(
                    'ce-cta-' + categoryId
                );

            if (currentCta) {

                currentCta.style.display = '';
                currentCta.style.height = 'auto';
                currentCta.style.minHeight = '0';
                currentCta.style.marginTop = '0';
                currentCta.style.marginBottom = '0';

                void currentCta.offsetWidth;

                currentCta.classList.add('panacea-submenu-active');

            }
            /*
             * Categoría activa.
             */
            categories.forEach(function (item) {
                item.classList.remove(
                    'elementor-item-active'
                );
            });

            link.classList.add(
                'elementor-item-active'
            );

        }


        /*
         * Hover de categorías.
         */
        categories.forEach(function (category) {

            category.addEventListener(
                'mouseenter',
                function () {

                    showSubcategories(category);

                }
            );

        });


        /*
         * Primera categoría por defecto.
         */
        if (categories.length) {
            showSubcategories(categories[0]);
        }

    }


    /*
     * =========================================================
     * ESPERAR A QUE CREATIVE ELEMENTS RENDERICE EL MEGAMENÚ
     * =========================================================
     */

    let attempts = 0;

    const timer = setInterval(function () {

        attempts++;

        if (
            document.querySelector(
                '#main-megamenu-fixed'
            )
        ) {

            clearInterval(timer);

            initMegaMenu();

        }

        if (attempts > 50) {

            clearInterval(timer);



        }

    }, 200);

})();