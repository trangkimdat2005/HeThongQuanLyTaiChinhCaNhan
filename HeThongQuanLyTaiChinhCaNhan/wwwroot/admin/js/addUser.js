// 1. XỬ LÝ PREVIEW ẢNH
function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
            $('#imagePreview').hide();
            $('#imagePreview').fadeIn(650);
        }
        reader.readAsDataURL(input.files[0]);
    }
}
$("#avatarInput").change(function () {
    readURL(this);
});

// 2. ẨN HIỆN MẬT KHẨU
function togglePass(id) {
    var x = document.getElementById(id);
    x.type = (x.type === "password") ? "text" : "password";
}

// 3. XỬ LÝ SUBMIT FORM (AJAX THẬT)
$('#createUserForm').on('submit', function (e) {
    e.preventDefault();

    // Validate Mật khẩu
    var p1 = $('#password').val();
    var p2 = $('#confirmPassword').val();

    if (p1 !== p2) {
        Swal.fire('Lỗi', 'Mật khẩu xác nhận không khớp!', 'error');
        return;
    }

    if (p1.length < 6) {
        Swal.fire('Lỗi', 'Mật khẩu phải từ 6 ký tự trở lên!', 'warning');
        return;
    }

    // Tạo FormData từ form hiện tại (bao gồm cả file ảnh và text)
    // Yêu cầu các input phải có thuộc tính name=""
    var formData = new FormData(this);

    Swal.fire({
        title: 'Đang lưu dữ liệu...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading() }
    });

    $.ajax({
        url: '/Admin/Users/Add', // Gọi đến Action Add trong UsersController
        type: 'POST',
        data: formData,
        contentType: false, // Bắt buộc false để gửi file
        processData: false, // Bắt buộc false để gửi file
        success: function (res) {
            if (res.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: res.message,
                    confirmButtonText: 'Về danh sách',
                    showCancelButton: true,
                    cancelButtonText: 'Thêm tiếp'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/Admin/Users'; // Chuyển về trang danh sách
                    } else {
                        // Reset form để nhập tiếp
                        $('#createUserForm')[0].reset();
                        $('#imagePreview').css('background-image', 'url(https://ui-avatars.com/api/?name=New+User&background=f0f0f0&color=999)');
                    }
                });
            } else {
                Swal.fire('Lỗi!', res.message, 'error');
            }
        },
        error: function () {
            Swal.fire('Lỗi!', 'Không thể kết nối đến server.', 'error');
        }
    });
});