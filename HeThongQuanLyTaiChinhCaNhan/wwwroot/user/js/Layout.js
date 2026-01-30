// Toggle Sidebar
$("#menu-toggle").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});


$(document).ready(function () {
    loadUserProfile();
});

function loadUserProfile() {
    $.ajax({
        url: '/User/Shared/GetUserProfile', // Đường dẫn tới Action ở Bước 1
        type: 'GET',
        success: function (response) {
            if (response.success) {
                const user = response.data;

                // 1. Cập nhật trên thanh Nav (Thẻ <a> bạn đã đưa)
                $('#navFullName').text(user.fullName);
                $('#navAvatar').attr('src', user.avatarUrl);

                // 2. Nếu có Form cập nhật thông tin, hãy đổ dữ liệu vào các input
                if ($('#updateInfoForm').length > 0) {
                    $('input[name="FullName"]').val(user.fullName);
                    $('input[name="DateOfBirth"]').val(user.dob);
                    $('input[name="Address"]').val(user.address);
                    $('input[name="City"]').val(user.city);
                    $('input[name="Country"]').val(user.country);
                }
            }
        },
        error: function (xhr) {
            console.error("Không thể lấy dữ liệu người dùng");
        }
    });
}



$(function () {
    // Gắn sự kiện click vào nút đăng xuất
    $('#logout-user').on('click', function (e) {
        e.preventDefault();
        logoutUser(); // Gọi hàm xác nhận
    });
});

function logoutUser() {
    Swal.fire({
        title: 'Bạn có chắc chắn muốn đăng xuất?',
        text: "Mọi phiên làm việc hiện tại sẽ kết thúc.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4e73df',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Đồng ý thoát',
        cancelButtonText: 'Hủy',
        allowOutsideClick: false
    }).then((result) => {
        if (result.isConfirmed) {
            // Hiện loading trong khi đợi Server xử lý
            Swal.fire({
                title: 'Đang đăng xuất...',
                didOpen: () => { Swal.showLoading() },
                allowOutsideClick: false
            });

            // Thực hiện Ajax logout
            $.ajax({
                url: '/Auth/LogoutUser',
                type: 'POST',
                data: {
                    // Lấy token chống giả mạo từ trang web
                    __RequestVerificationToken: $('input[name="__RequestVerificationToken"]').val()
                },
                success: function (response) {
                    if (response.status === 'SUCCESS') {
                        // Thông báo thành công trước khi chuyển trang
                        Swal.fire({
                            icon: 'success',
                            title: 'Đã đăng xuất thành công!',
                            showConfirmButton: false,
                            timer: 1500
                        }).then(() => {
                            window.location.href = response.redirectUrl;
                        });
                    } else {
                        Swal.fire('Lỗi', response.message || 'Không thể đăng xuất', 'error');
                    }
                },
                error: function (xhr) {
                    console.log(xhr.responseText);
                    Swal.fire('Lỗi hệ thống', 'Có lỗi xảy ra khi gửi yêu cầu đăng xuất.', 'error');
                }
            });
        }
    });
}




document.addEventListener("DOMContentLoaded", function () {
    // 1. Lấy đường dẫn hiện tại (ví dụ: /User/Transactions)
    const currentUrl = window.location.pathname.toLowerCase();

    // 2. Lấy tất cả các đường link trong menu
    const menuItems = document.querySelectorAll('.list-group-item');

    menuItems.forEach(item => {
        // Lấy giá trị href mà ASP.NET đã render ra
        const itemHref = item.getAttribute('href').toLowerCase();

        // 3. Kiểm tra logic để active
        // Nếu URL hiện tại khớp chính xác hoặc chứa đường dẫn của item
        if (currentUrl === itemHref || (itemHref !== "/" && currentUrl.startsWith(itemHref))) {
            // Xóa hết active của các mục khác (phòng hờ)
            menuItems.forEach(el => el.classList.remove('active-menu'));

            // Thêm class active vào mục đúng
            item.classList.add('active-menu');
        }
    });
});