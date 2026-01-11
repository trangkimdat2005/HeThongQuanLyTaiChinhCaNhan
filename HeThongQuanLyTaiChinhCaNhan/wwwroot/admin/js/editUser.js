// --- 1. GIẢ LẬP DỮ LIỆU TỪ DATABASE ĐỔ VÀO FORM ---
// Trong thực tế, bạn sẽ lấy ID từ URL (VD: edit-user.html?id=user-01) rồi gọi API
$(document).ready(function () {
    // Dữ liệu giả (Mock Data) khớp với DB mẫu bạn đưa
    var mockUser = {
        UserID: "user-01",
        Email: "nguyenvana@test.com",
        FullName: "Nguyễn Văn A",
        AvatarUrl: "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random", // Link ảnh giả
        DateOfBirth: "1995-05-15",
        Address: "123 Đường Lê Lợi",
        City: "Hồ Chí Minh",
        Country: "Việt Nam",
        Role: "User",
        IsActive: "1" // 1 = Active
    };

    // Đổ dữ liệu vào các ô input
    $('#headerUserName').text(mockUser.FullName);
    $('#userID').val(mockUser.UserID);
    $('#email').val(mockUser.Email);
    $('#fullName').val(mockUser.FullName);
    $('#dob').val(mockUser.DateOfBirth);
    $('#address').val(mockUser.Address);
    $('#city').val(mockUser.City);
    $('#country').val(mockUser.Country);
    $('#role').val(mockUser.Role);
    $('#isActive').val(mockUser.IsActive);

    // Set ảnh avatar
    $('#imagePreview').css('background-image', 'url(' + mockUser.AvatarUrl + ')');
});

// --- 2. XỬ LÝ PREVIEW ẢNH MỚI ---
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

// --- 3. ẨN HIỆN PASS ---
function togglePass(id) {
    var x = document.getElementById(id);
    x.type = (x.type === "password") ? "text" : "password";
}

// --- 4. XỬ LÝ UPDATE ---
$('#editUserForm').on('submit', function (e) {
    e.preventDefault();

    // Check đổi mật khẩu
    var p1 = $('#password').val();
    var p2 = $('#confirmPassword').val();

    if (p1 !== "" && p1 !== p2) {
        Swal.fire('Lỗi', 'Mật khẩu mới không khớp!', 'error');
        return;
    }

    // Giả lập Update
    Swal.fire({
        title: 'Đang cập nhật...',
        text: 'UPDATE Users SET FullName = ... WHERE UserID = "user-01"',
        timer: 1500,
        timerProgressBar: true,
        didOpen: () => { Swal.showLoading() }
    }).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Đã lưu thay đổi!',
            text: 'Thông tin người dùng đã được cập nhật.',
            confirmButtonText: 'Quay lại danh sách'
        }).then((res) => {
            if (res.isConfirmed) {
                window.location.href = '/admin/users.html';
            }
        });
    });
});