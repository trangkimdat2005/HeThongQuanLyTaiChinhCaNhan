// 1. MOCK DATA (Giống record trong Users table)
var currentUser = {
    UserID: "user-01",
    Email: "nguyenvana@test.com",
    FullName: "Nguyễn Văn A",
    AvatarUrl: "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=4e73df&color=fff",
    Address: "123 Đường Lê Lợi",
    City: "Hồ Chí Minh",
    Country: "Việt Nam",
    DateOfBirth: "1995-05-15",
    Role: "User",
    LastLogin: "2026-01-11 08:30:00",
    CreatedAt: "2025-12-01"
};

$(document).ready(function () {
    loadProfile();
});

// 2. LOAD DATA VÀO FORM
function loadProfile() {
    // Cột Trái (Summary)
    $('#profileAvatar').attr('src', currentUser.AvatarUrl);
    $('#displayFullName').text(currentUser.FullName);
    $('#displayRole').text(currentUser.Role);

    // Format ngày hiển thị cho đẹp
    var joinDate = new Date(currentUser.CreatedAt).toLocaleDateString('vi-VN');
    var lastLogin = new Date(currentUser.LastLogin).toLocaleDateString('vi-VN'); // Có thể dùng moment.js để hiện '2 phút trước'

    $('#displayJoinDate').text(joinDate);
    $('#displayLastLogin').text("Vừa xong"); // Giả lập

    // Cột Phải (Form Info)
    $('#userEmail').val(currentUser.Email);
    $('#fullName').val(currentUser.FullName);
    $('#dob').val(currentUser.DateOfBirth);
    $('#address').val(currentUser.Address);
    $('#city').val(currentUser.City);
    $('#country').val(currentUser.Country);
}

// 3. XỬ LÝ UPLOAD AVATAR (PREVIEW)
$("#uploadAvatar").change(function () {
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            // Hiển thị ảnh vừa chọn lên thẻ img
            $('#profileAvatar').attr('src', e.target.result);
            // Đồng thời cập nhật avatar nhỏ trên navbar (nếu có id)
            $('.avatar-img').attr('src', e.target.result);
        }
        reader.readAsDataURL(this.files[0]);

        // Thực tế: Cần gọi API upload ảnh lên server, lấy URL lưu vào DB cột AvatarUrl
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Ảnh đại diện đã được cập nhật',
            showConfirmButton: false,
            timer: 2000
        });
    }
});

// 4. CẬP NHẬT THÔNG TIN
$('#updateInfoForm').on('submit', function (e) {
    e.preventDefault();

    // Lấy giá trị mới
    var newName = $('#fullName').val();

    // Giả lập Loading
    Swal.fire({
        title: 'Đang lưu...',
        didOpen: () => { Swal.showLoading() },
        timer: 1000
    }).then(() => {
        // Update UI
        $('#displayFullName').text(newName);
        // Cập nhật tên trên Navbar (nếu có class .username-nav)

        Swal.fire('Thành công', 'Thông tin cá nhân đã được lưu.', 'success');
    });
});

// 5. ĐỔI MẬT KHẨU
$('#changePassForm').on('submit', function (e) {
    e.preventDefault();

    var current = $('#currentPass').val();
    var newP = $('#newPass').val();
    var confirmP = $('#confirmPass').val();

    if (newP !== confirmP) {
        Swal.fire('Lỗi', 'Mật khẩu xác nhận không khớp!', 'error');
        return;
    }

    if (newP.length < 6) {
        Swal.fire('Yếu', 'Mật khẩu phải có ít nhất 6 ký tự!', 'warning');
        return;
    }

    Swal.fire({
        title: 'Đang xử lý...',
        didOpen: () => { Swal.showLoading() },
        timer: 1500
    }).then(() => {
        $('#changePassForm')[0].reset();
        Swal.fire('Thành công', 'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại vào lần sau.', 'success');
    });
});

// Helper: Ẩn hiện pass
function togglePass(id) {
    var x = document.getElementById(id);
    x.type = (x.type === "password") ? "text" : "password";
}