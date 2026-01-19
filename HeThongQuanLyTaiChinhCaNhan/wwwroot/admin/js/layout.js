document.addEventListener("DOMContentLoaded", function () {

    // 1. ACTIVE MENU: Tự động tô màu menu dựa vào URL hiện tại
    const currentPath = window.location.pathname.toLowerCase();
    const menuLinks = document.querySelectorAll('#sidebar-wrapper .list-group-item');

    // Reset hết active cũ
    menuLinks.forEach(link => link.classList.remove('active-menu'));

    // Tìm link phù hợp để active
    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.length > 1) {
            const linkPath = href.toLowerCase();

            // Logic so sánh: Nếu URL hiện tại chứa link menu (VD: /Admin/Users/Edit chứa /Admin/Users)
            if (currentPath.includes(linkPath) && !linkPath.includes('logout')) {
                link.classList.add('active-menu');
            }
            // Xử lý riêng trang Dashboard (tránh nhận nhầm /Admin)
            else if ((currentPath === '/admin' || currentPath === '/admin/') && linkPath.includes('dashboard')) {
                link.classList.add('active-menu');
            }
        }
    });

    // 2. TOGGLE SIDEBAR
    const sidebarToggle = document.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
        });
    }
});

// 3. LOGOUT FUNCTION
function logoutAdmin() {
    Swal.fire({
        title: 'Đăng xuất?',
        text: "Kết thúc phiên làm việc hiện tại.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Đăng xuất',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            // Chuyển hướng đến Action Logout trong Controller
            window.location.href = "/Auth/Logout";
        }
    })
}
