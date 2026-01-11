// 1. XỬ LÝ PREVIEW ẢNH (AVATAR URL)
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

// 3. XỬ LÝ SUBMIT FORM (MÔ PHỎNG)
document.getElementById('createUserForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Validate Mật khẩu
    var p1 = document.getElementById('password').value;
    var p2 = document.getElementById('confirmPassword').value;

    if (p1 !== p2) {
        Swal.fire('Lỗi', 'Mật khẩu xác nhận không khớp!', 'error');
        return;
    }

    // Giả lập loading và gửi dữ liệu
    Swal.fire({
        title: 'Đang lưu vào CSDL...',
        html: 'INSERT INTO Users (...) VALUES (...)',
        timer: 1500,
        timerProgressBar: true,
        didOpen: () => { Swal.showLoading() }
    }).then((result) => {
        Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Đã thêm user mới vào bảng Users.',
            confirmButtonText: 'OK'
        }).then(() => {
            // Logic sau khi lưu thành công (ví dụ: reload hoặc chuyển trang)
            // window.location.href = '/admin/users.html'; 
        });
    });
});