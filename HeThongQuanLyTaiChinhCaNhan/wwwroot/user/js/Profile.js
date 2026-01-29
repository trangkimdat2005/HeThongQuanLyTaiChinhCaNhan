$(document).ready(function () {
    loadProfile();
});

// Helper: Lấy AntiForgeryToken
function getAntiForgeryToken() {
    return $('input[name="__RequestVerificationToken"]').val();
}

// 1. LOAD DATA TỪ SERVER
function loadProfile() {
    $.ajax({
        url: '/User/Profile/GetProfile',
        type: 'GET',
        success: function (response) {
            if (response.success) {
                var user = response.data;
                
                // Cột Trái (Summary)
                $('#profileAvatar').attr('src', user.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName || 'User') + '&background=random');
                $('#displayFullName').text(user.fullName || 'Chưa cập nhật');
                $('#displayRole').text(user.role || 'User');
                $('#displayJoinDate').text(user.createdAt || '...');
                $('#displayLastLogin').text(user.lastLogin || '...');

                // Cột Phải (Form Info)
                $('#userEmail').val(user.email);
                $('#fullName').val(user.fullName || '');
                $('#dob').val(user.dateOfBirth || '');
                $('#address').val(user.address || '');
                $('#city').val(user.city || '');
                $('#country').val(user.country || '');
            } else {
                Swal.fire('Lỗi', response.message, 'error');
            }
        },
        error: function () {
            Swal.fire('Lỗi', 'Không thể tải thông tin profile', 'error');
        }
    });
}

// 2. XỬ LÝ UPLOAD AVATAR
$("#uploadAvatar").change(function () {
    if (this.files && this.files[0]) {
        var formData = new FormData();
        formData.append('avatar', this.files[0]);
        formData.append('__RequestVerificationToken', getAntiForgeryToken());
        
        // Preview ảnh trước
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#profileAvatar').attr('src', e.target.result);
        }
        reader.readAsDataURL(this.files[0]);

        // Upload lên server
        $.ajax({
            url: '/User/Profile/UploadAvatar',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            beforeSend: function() {
                Swal.fire({
                    title: 'Đang tải lên...',
                    allowOutsideClick: false,
                    didOpen: () => { Swal.showLoading() }
                });
            },
            success: function (response) {
                Swal.close();
                if (response.success) {
                    $('#profileAvatar').attr('src', response.avatarUrl);
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Cập nhật avatar thành công!',
                        showConfirmButton: false,
                        timer: 2000
                    });
                } else {
                    Swal.fire('Lỗi', response.message, 'error');
                }
            },
            error: function (xhr) {
                Swal.close();
                var errorMsg = xhr.responseJSON?.message || 'Không thể upload ảnh';
                Swal.fire('Lỗi', errorMsg, 'error');
            }
        });
    }
});

// 3. CẬP NHẬT THÔNG TIN CÁ NHÂN
$('#updateInfoForm').on('submit', function (e) {
    e.preventDefault();

    var formData = new FormData(this);

    $.ajax({
        url: '/User/Profile/UpdateInfo',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        beforeSend: function() {
            Swal.fire({
                title: 'Đang lưu...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading() }
            });
        },
        success: function (response) {
            Swal.close();
            if (response.success) {
                $('#displayFullName').text($('#fullName').val());
                Swal.fire('Thành công', response.message, 'success');
            } else {
                Swal.fire('Lỗi', response.message, 'error');
            }
        },
        error: function (xhr) {
            Swal.close();
            var errorMsg = xhr.responseJSON?.message || 'Không thể cập nhật thông tin';
            Swal.fire('Lỗi', errorMsg, 'error');
        }
    });
});

// 4. ĐỔI MẬT KHẨU
$('#changePassForm').on('submit', function (e) {
    e.preventDefault();

    var currentPass = $('#currentPass').val();
    var newPass = $('#newPass').val();
    var confirmPass = $('#confirmPass').val();

    // Validate
    if (newPass !== confirmPass) {
        Swal.fire('Lỗi', 'Mật khẩu xác nhận không khớp!', 'error');
        return;
    }

    if (newPass.length < 6) {
        Swal.fire('Yếu', 'Mật khẩu phải có ít nhất 6 ký tự!', 'warning');
        return;
    }

    var formData = new FormData(this);

    $.ajax({
        url: '/User/Profile/ChangePassword',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        beforeSend: function() {
            Swal.fire({
                title: 'Đang xử lý...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading() }
            });
        },
        success: function (response) {
            Swal.close();
            if (response.success) {
                $('#changePassForm')[0].reset();
                Swal.fire('Thành công', response.message, 'success');
            } else {
                Swal.fire('Lỗi', response.message, 'error');
            }
        },
        error: function (xhr) {
            Swal.close();
            var errorMsg = xhr.responseJSON?.message || 'Không thể đổi mật khẩu';
            Swal.fire('Lỗi', errorMsg, 'error');
        }
    });
});

// Helper: Ẩn hiện mật khẩu
function togglePass(id) {
    var x = document.getElementById(id);
    var icon = $(x).siblings('button').find('i');
    
    if (x.type === "password") {
        x.type = "text";
        icon.removeClass('fa-eye').addClass('fa-eye-slash');
    } else {
        x.type = "password";
        icon.removeClass('fa-eye-slash').addClass('fa-eye');
    }
}
