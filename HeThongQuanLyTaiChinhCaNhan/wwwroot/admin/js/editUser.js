// 1. PREVIEW ẢNH
$("#avatarInput").change(function () {
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
            $('#imagePreview').hide().fadeIn(650);
        }
        reader.readAsDataURL(this.files[0]);
    }
});

// 2. TOGGLE PASSWORD
function togglePass(id) {
    var x = document.getElementById(id);
    x.type = (x.type === "password") ? "text" : "password";
}

// 3. XỬ LÝ SUBMIT FORM
$('#editUserForm').on('submit', function (e) {
    e.preventDefault();

    var p1 = $('#password').val();
    var p2 = $('#confirmPassword').val();

    // Chỉ check pass nếu người dùng có nhập pass mới
    if (p1 !== "" && p1 !== p2) {
        Swal.fire('Lỗi', 'Mật khẩu xác nhận không khớp!', 'error');
        return;
    }

    var formData = new FormData(this);

    Swal.fire({
        title: 'Đang cập nhật...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading() }
    });

    $.ajax({
        url: '/Admin/Users/Edit',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function (res) {
            if (res.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Đã lưu thay đổi!',
                    text: res.message,
                    confirmButtonText: 'Quay lại danh sách'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/Admin/Users';
                    }
                });
            } else {
                Swal.fire('Lỗi!', res.message, 'error');
            }
        },
        error: function () {
            Swal.fire('Lỗi!', 'Không kết nối được server.', 'error');
        }
    });
});