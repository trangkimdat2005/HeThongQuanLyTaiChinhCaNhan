$(document).ready(function () {

    // 1. Xem trước Avatar (Preview) khi chọn file
    $("#uploadAvatar").change(function () {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#profileAvatar').attr('src', e.target.result);
            }
            reader.readAsDataURL(this.files[0]);
        }
    });

    // 2. Cập nhật thông tin (Bao gồm cả upload ảnh)
    $('#updateProfileForm').on('submit', function (e) {
        e.preventDefault();

        // Dùng FormData để gửi được File
        var formData = new FormData(this);

        // Lấy file từ input (vì input file nằm ngoài hoặc cần chắc chắn)
        // Trong View tôi đã để input name="avatar" bên trong form nên FormData tự lấy được.
        // Nhưng nếu input file nằm ngoài form thì dùng dòng này:
        // var fileInput = $('#uploadAvatar')[0].files[0];
        // if(fileInput) formData.append('avatar', fileInput);

        Swal.fire({
            title: 'Đang xử lý...',
            text: 'Đang lưu thông tin và tải ảnh lên (nếu có)',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading() }
        });

        $.ajax({
            url: '/Admin/Account/UpdateProfile',
            type: 'POST',
            data: formData,
            // 2 dòng này BẮT BUỘC phải có khi gửi FormData (File)
            processData: false,
            contentType: false,
            success: function (res) {
                if (res.success) {
                    // Update tên hiển thị
                    $('#displayFullName').text($('#fullName').val());

                    // Nếu Server trả về link avatar mới, update lại cho chắc (tránh cache)
                    if (res.newAvatar) {
                        $('#profileAvatar').attr('src', res.newAvatar + '?t=' + new Date().getTime());
                        // Reset input file để lần sau change sự kiện vẫn bắt
                        $('#uploadAvatar').val('');
                    }

                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công',
                        text: res.message,
                        timer: 1500,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire('Lỗi', res.message, 'error');
                }
            },
            error: function () {
                Swal.fire('Lỗi', 'Không kết nối được server.', 'error');
            }
        });
    });

    // 3. Đổi mật khẩu
    $('#changePassForm').on('submit', function (e) {
        e.preventDefault();

        var newPass = $('#newPass').val();
        var confirmPass = $('#confirmPass').val();

        if (newPass !== confirmPass) {
            Swal.fire('Lỗi', 'Mật khẩu xác nhận không khớp!', 'error');
            return;
        }

        Swal.fire({
            title: 'Đang đổi mật khẩu...',
            didOpen: () => { Swal.showLoading() }
        });

        // Form này chỉ có text nên dùng .serialize() là đủ
        $.post('/Admin/Account/ChangePassword', $(this).serialize(), function (res) {
            if (res.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Đã đổi mật khẩu',
                    text: 'Vui lòng ghi nhớ mật khẩu mới.',
                }).then(() => {
                    $('#changePassForm')[0].reset();
                });
            } else {
                Swal.fire('Thất bại', res.message, 'error');
            }
        }).fail(function () {
            Swal.fire('Lỗi', 'Không kết nối được server.', 'error');
        });
    });

});