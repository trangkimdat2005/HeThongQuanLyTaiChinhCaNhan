// =====================================================
// AJAX NAVIGATION SYSTEM - Admin Area
// =====================================================
// T?i n?i dung ??ng mà không reload toàn trang

(function () {
    'use strict';

    // C?u hình
    const CONFIG = {
        contentSelector: '#dynamic-content',
        loaderSelector: '#ajax-loader',
        linkSelector: '.ajax-link',
        activeClass: 'active',
        fadeSpeed: 200
    };

    // Cache jQuery objects
    const $contentContainer = $(CONFIG.contentSelector);
    const $loader = $(CONFIG.loaderSelector);

    // =====================================================
    // 1. FUNCTION: Load n?i dung qua AJAX
    // =====================================================
    function loadContent(url, pushState = true) {
        // Validate URL
        if (!url || url === '#') {
            console.warn('[AJAX Nav] Invalid URL:', url);
            return;
        }

        // Hi?n th? loading
        $loader.fadeIn(CONFIG.fadeSpeed);
        $contentContainer.fadeOut(CONFIG.fadeSpeed);

        // G?i AJAX
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'html',
            timeout: 10000,
            success: function (response) {
                // Parse HTML response
                const $response = $(response);

                // Tìm n?i dung chính (bên trong #dynamic-content n?u có, ho?c toàn b? response)
                let newContent = $response.filter(CONFIG.contentSelector).html();
                
                // N?u không tìm th?y selector, dùng toàn b? response
                if (!newContent || newContent.trim() === '') {
                    newContent = response;
                }

                // C?p nh?t content
                $contentContainer.html(newContent);

                // Update browser history (n?u c?n)
                if (pushState && window.history && window.history.pushState) {
                    window.history.pushState({ path: url }, '', url);
                }

                // Update active state trong menu
                updateActiveMenu(url);

                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // ?n loader, hi?n content
                $loader.fadeOut(CONFIG.fadeSpeed);
                $contentContainer.fadeIn(CONFIG.fadeSpeed, function () {
                    // Callback sau khi load xong
                    reinitializePageScripts();
                });

                console.log('[AJAX Nav] ? Loaded:', url);
            },
            error: function (xhr, status, error) {
                console.error('[AJAX Nav] ? Error:', error);

                // Hi?n th? thông báo l?i
                const errorHtml = `
                    <div class="alert alert-danger" role="alert">
                        <h4 class="alert-heading"><i class="fas fa-exclamation-triangle"></i> L?i t?i trang</h4>
                        <p>Không th? t?i n?i dung. Vui lòng th? l?i.</p>
                        <hr>
                        <p class="mb-0">
                            <button class="btn btn-sm btn-danger" onclick="location.reload()">
                                <i class="fas fa-redo"></i> T?i l?i trang
                            </button>
                        </p>
                    </div>
                `;

                $contentContainer.html(errorHtml);
                $loader.fadeOut(CONFIG.fadeSpeed);
                $contentContainer.fadeIn(CONFIG.fadeSpeed);

                // Fallback: Reload trang n?u l?i nghiêm tr?ng
                if (xhr.status === 500 || xhr.status === 404) {
                    setTimeout(() => {
                        if (confirm('?ã x?y ra l?i. B?n có mu?n t?i l?i trang?')) {
                            window.location.href = url;
                        }
                    }, 2000);
                }
            }
        });
    }

    // =====================================================
    // 2. FUNCTION: C?p nh?t active class cho menu
    // =====================================================
    function updateActiveMenu(currentUrl) {
        // Lo?i b? active class c?
        $(CONFIG.linkSelector).removeClass(CONFIG.activeClass);

        // Thêm active class cho link hi?n t?i
        $(CONFIG.linkSelector).each(function () {
            const linkUrl = $(this).attr('data-url') || $(this).attr('href');
            
            // So sánh URL (normalize tr??c)
            const normalizedLink = linkUrl.toLowerCase().replace(/\/$/, '');
            const normalizedCurrent = currentUrl.toLowerCase().replace(/\/$/, '');

            if (normalizedLink === normalizedCurrent) {
                $(this).addClass(CONFIG.activeClass);
                console.log('[AJAX Nav] Active:', linkUrl);
            }
        });
    }

    // =====================================================
    // 3. FUNCTION: Kh?i t?o l?i các script sau khi load
    // =====================================================
    function reinitializePageScripts() {
        // Reinitialize DataTables (n?u có)
        if ($.fn.DataTable) {
            $('.table').each(function () {
                if (!$.fn.DataTable.isDataTable(this)) {
                    try {
                        $(this).DataTable({
                            language: {
                                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/vi.json'
                            },
                            pageLength: 10,
                            responsive: true
                        });
                    } catch (e) {
                        console.warn('[DataTables] Init failed:', e);
                    }
                }
            });
        }

        // Reinitialize Tooltips
        if (typeof bootstrap !== 'undefined') {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }

        // Trigger custom event ?? các page-specific scripts có th? hook vào
        $(document).trigger('ajaxContentLoaded');

        console.log('[AJAX Nav] Scripts reinitialized');
    }

    // =====================================================
    // 4. EVENT: Click vào menu links
    // =====================================================
    $(document).on('click', CONFIG.linkSelector, function (e) {
        e.preventDefault();

        const url = $(this).attr('data-url') || $(this).attr('href');
        
        // Không load n?u ?ang ? trang ?ó r?i
        if ($(this).hasClass(CONFIG.activeClass)) {
            console.log('[AJAX Nav] Already on this page');
            return;
        }

        loadContent(url, true);
    });

    // =====================================================
    // 5. EVENT: Browser back/forward buttons
    // =====================================================
    window.addEventListener('popstate', function (event) {
        if (event.state && event.state.path) {
            loadContent(event.state.path, false);
        }
    });

    // =====================================================
    // 6. INITIALIZATION: Set active menu khi load trang
    // =====================================================
    $(document).ready(function () {
        const currentPath = window.location.pathname;
        updateActiveMenu(currentPath);

        // L?u state ban ??u
        if (window.history && window.history.replaceState) {
            window.history.replaceState({ path: currentPath }, '', currentPath);
        }

        console.log('[AJAX Nav] ? Initialized');
    });

    // =====================================================
    // 7. PUBLIC API (n?u c?n g?i t? bên ngoài)
    // =====================================================
    window.AjaxNav = {
        loadPage: loadContent,
        reinitScripts: reinitializePageScripts
    };

})();
