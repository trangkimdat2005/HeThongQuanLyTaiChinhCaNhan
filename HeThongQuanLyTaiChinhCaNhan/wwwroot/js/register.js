document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Lấy giá trị
    const p1 = document.getElementById('password').value;
    const p2 = document.getElementById('confirmPassword').value;
    const name = document.getElementById('fullName').value;

    // 1. Validate Mật khẩu khớp
    if (p1 !== p2) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Mật khẩu nhập lại không khớp!',
        });
        return;
    }

    // 2. Validate độ dài (Ví dụ)
    if (p1.length < 6) {
        Swal.fire({
            icon: 'warning',
            title: 'Mật khẩu yếu',
            text: 'Mật khẩu phải có ít nhất 6 ký tự.',
        });
        return;
    }

    // 3. Giả lập gửi API đăng ký
    let timerInterval;
    Swal.fire({
        title: 'Đang tạo tài khoản...',
        html: 'Vui lòng chờ trong giây lát.',
        timer: 1500,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
        }
    }).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Đăng ký thành công!',
            text: 'Chào mừng ' + name + '! Vui lòng đăng nhập để tiếp tục.',
            confirmButtonText: 'Đến trang Đăng nhập'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'login.html';
            }
        });
    });
});