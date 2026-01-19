// Toggle Sidebar
$("#menu-toggle").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

// Logout
function logoutUser() {
    Swal.fire({
        title: 'Đăng xuất?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4e73df',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Thoát'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Đã đăng xuất', '', 'success');
        }
    })
}