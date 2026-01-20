// XỬ LÝ JS
$(document).ready(function () {

    // BƯỚC 1: GỬI THÔNG TIN ĐĂNG KÝ -> NHẬN OTP
    $('#step1Form').on('submit', function (e) {
        e.preventDefault();

        var password = $('#Password').val();
        var confirm = $('#ConfirmPassword').val();
        if (password !== confirm) {
            Swal.fire('Lỗi', 'Mật khẩu xác nhận không khớp', 'error');
            return;
        }

        var formData = $(this).serialize(); // Lấy data form

        // Hiển thị loading
        var btn = $(this).find('button[type="submit"]');
        var originalText = btn.html();
        btn.html('<i class="fas fa-spinner fa-spin"></i> Đang xử lý...').prop('disabled', true);

        $.ajax({
            url: '/Auth/RegisterStep1',
            type: 'POST',
            data: formData,
            success: function (res) {
                btn.html(originalText).prop('disabled', false);
                if (res.success) {
                    // Chuyển sang bước 2
                    $('#step1Form').hide();
                    $('#homeLink').hide();
                    $('#step2Form').show();

                    // Cập nhật giao diện
                    $('#headerTitle').text('Xác Thực Email');
                    $('#headerSub').text('Vui lòng kiểm tra hộp thư đến (cả mục Spam)');
                    $('#displayEmail').text($('#Email').val());

                    Swal.fire({ icon: 'success', title: 'Đã gửi OTP!', text: 'Vui lòng kiểm tra email.', timer: 1500, showConfirmButton: false });
                } else {
                    Swal.fire('Lỗi', res.message, 'error');
                }
            },
            error: function () {
                btn.html(originalText).prop('disabled', false);
                Swal.fire('Lỗi', 'Không kết nối được server', 'error');
            }
        });
    });

    // BƯỚC 2: GỬI OTP -> TẠO TÀI KHOẢN
    $('#step2Form').on('submit', function (e) {
        e.preventDefault();

        var otp = $('#otpCode').val();
        var email = $('#Email').val();
        var token = $('input[name="__RequestVerificationToken"]').val(); // Lấy token từ form 1

        if (otp.length < 6) {
            Swal.fire('Lỗi', 'Vui lòng nhập đủ 6 số OTP', 'warning');
            return;
        }

        $.ajax({
            url: '/Auth/RegisterStep2',
            type: 'POST',
            data: {
                Email: email,
                OtpCode: otp,
                __RequestVerificationToken: token
            },
            success: function (res) {
                if (res.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công!',
                        text: 'Tài khoản đã được tạo. Vui lòng đăng nhập.',
                        confirmButtonText: 'Đăng nhập ngay'
                    }).then((result) => {
                        window.location.href = '/Auth/Login';
                    });
                } else {
                    Swal.fire('Thất bại', res.message, 'error');
                }
            },
            error: function () {
                Swal.fire('Lỗi', 'Lỗi hệ thống', 'error');
            }
        });
    });
});

function backToStep1() {
    $('#step2Form').hide();
    $('#step1Form').show();
    $('#homeLink').show();
    $('#headerTitle').text('Tạo Tài Khoản');
    $('#headerSub').text('Bắt đầu hành trình quản lý tài chính ngay hôm nay!');
}