// 1. Logic ẩn hiện Sidebar
const sidebarToggle = document.body.querySelector('#sidebarToggle');
if (sidebarToggle) {
    sidebarToggle.addEventListener('click', event => {
        event.preventDefault();
        document.body.classList.toggle('sb-sidenav-toggled');
    });
}

// 2. Logic Đăng xuất
function logoutAdmin() {
    Swal.fire({
        title: 'Bạn muốn đăng xuất?',
        text: "Kết thúc phiên làm việc của Admin.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Đăng xuất',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Đã đăng xuất', '', 'success');
            // Chỗ này sau này sẽ code chuyển hướng về trang Login
        }
    })
}
document.addEventListener("DOMContentLoaded", function () {
    // 1. Lấy đường dẫn hiện tại
    const currentPath = window.location.pathname.toLowerCase();

    // 2. Lấy danh sách tất cả các thẻ <a> trong menu
    const menuLinks = document.querySelectorAll('#sidebar-wrapper .list-group-item');

    // --- BƯỚC QUAN TRỌNG: RESET ---
    // Duyệt qua TẤT CẢ các link và XÓA class active-menu đi (để tránh bị trùng)
    menuLinks.forEach(link => {
        link.classList.remove('active-menu');
    });

    // --- BƯỚC TIẾP THEO: ACTIVE CÁI MỚI ---
    menuLinks.forEach(link => {
        const linkAttribute = link.getAttribute('href');

        if (linkAttribute) {
            const linkPath = linkAttribute.toLowerCase();

            // Logic so sánh:
            // 1. Đường dẫn hiện tại phải chứa link menu (VD: /Admin/Users/Edit chứa /Admin/Users)
            // 2. Bỏ qua link logout và link rỗng (#)
            // 3. Xử lý riêng trường hợp Dashboard (vì nó hay bị trùng với root /)

            if (linkPath.length > 1 && currentPath.includes(linkPath) && !linkPath.includes('logout')) {
                link.classList.add('active-menu');
            }
            // Trường hợp đặc biệt: Nếu đang ở đúng trang Dashboard gốc
            else if (currentPath === '/admin' || currentPath === '/admin/') {
                if (linkPath.includes('dashboard')) {
                    link.classList.add('active-menu');
                }
            }
        }
    });
});