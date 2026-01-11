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