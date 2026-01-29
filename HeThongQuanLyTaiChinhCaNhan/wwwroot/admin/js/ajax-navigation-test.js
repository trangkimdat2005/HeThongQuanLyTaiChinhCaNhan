// =====================================================
// TEST AJAX NAVIGATION - Copy vào Console ?? test
// =====================================================

// 1. Test load trang Users
console.log('Testing AJAX Nav - Loading Users page...');
window.AjaxNav.loadPage('/Admin/Users');

// 2. Sau 2 giây, load trang Dashboard
setTimeout(() => {
    console.log('Loading Dashboard...');
    window.AjaxNav.loadPage('/Admin/Dashboard');
}, 2000);

// 3. Sau 4 giây, load trang Categories
setTimeout(() => {
    console.log('Loading Categories...');
    window.AjaxNav.loadPage('/Admin/Categories');
}, 4000);

// 4. Ki?m tra active menu
setTimeout(() => {
    console.log('Active menu items:', $('.ajax-link.active').length);
    $('.ajax-link.active').each(function() {
        console.log('Active:', $(this).attr('data-url'));
    });
}, 5000);

// =====================================================
// MANUAL TESTS
// =====================================================

// Test reinitialize scripts
// window.AjaxNav.reinitScripts();

// Test load v?i URL không h?p l?
// window.AjaxNav.loadPage('/Admin/NonExistentPage');

// Check browser history
// console.log('History length:', window.history.length);

// =====================================================
// EVENT LISTENERS FOR DEBUGGING
// =====================================================

$(document).on('ajaxContentLoaded', function() {
    console.log('? Event: ajaxContentLoaded fired');
});

$(document).on('click', '.ajax-link', function() {
    console.log('? Clicked on:', $(this).attr('data-url'));
});

console.log('? Test script loaded. AJAX Navigation is ready!');
