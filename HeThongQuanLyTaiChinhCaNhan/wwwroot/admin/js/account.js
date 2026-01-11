// Xem trước avatar khi chọn
$("#uploadAvatar").change(function () {
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#profileAvatar').attr('src', e.target.result);
        }
        reader.readAsDataURL(this.files[0]);
    }
});

// Submit thông tin
$('#updateProfileForm').on('submit', function (e) {
    e.preventDefault();
    Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Thông tin cá nhân đã được cập nhật!',
        timer: 1500,
        showConfirmButton: false
    });
});

// Submit đổi pass
$('#changePassForm').on('submit', function (e) {
    e.preventDefault();
    var p1 = $('#newPass').val();
    var p2 = $('#confirmPass').val();

    if (p1 !== p2) {
        Swal.fire('Lỗi', 'Mật khẩu xác nhận không khớp', 'error');
        return;
    }

    Swal.fire({
        icon: 'success',
        title: 'Đã đổi mật khẩu',
        text: 'Vui lòng đăng nhập lại với mật khẩu mới.',
    });
});