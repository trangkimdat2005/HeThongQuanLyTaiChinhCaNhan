$(document).ready(function () {
    // 1. SINH DỮ LIỆU GIẢ (50 USER) ĐỂ TEST PHÂN TRANG
    // Trong thực tế, cái này là dữ liệu lấy từ Database về
    const fakeData = [];
    const firstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng"];
    const lastNames = ["Văn A", "Thị B", "Quốc C", "Minh Khôi", "Gia Hân", "Bảo Ngọc", "Anh Tuấn", "Đức Minh", "Thanh Hà"];
    const roles = ["User", "User", "User", "User", "Admin"]; // Tỉ lệ User nhiều hơn Admin
    const statuses = ["Active", "Active", "Active", "Banned"]; // Thi thoảng có ông bị Ban

    for (let i = 1; i <= 50; i++) {
        let rdFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
        let rdLast = lastNames[Math.floor(Math.random() * lastNames.length)];
        let fullName = `${rdFirst} ${rdLast}`;
        let role = roles[Math.floor(Math.random() * roles.length)];
        let status = statuses[Math.floor(Math.random() * statuses.length)];

        fakeData.push({
            id: i,
            name: fullName,
            email: removeVietnameseTones(fullName).toLowerCase().replace(/\s/g, '') + i + "@gmail.com",
            role: role,
            status: status,
            joinDate: `0${Math.floor(Math.random() * 9) + 1}/01/2026`
        });
    }

    // 2. KÍCH HOẠT DATATABLES (CÁI MÀY CẦN)
    var table = $('#tableUser').DataTable({
        data: fakeData, // Nạp dữ liệu giả vào

        // Cấu hình các cột
        columns: [
            { data: 'id', render: function (data) { return `<span class="fw-bold text-muted">#${data}</span>`; } },
            {
                data: 'name',
                render: function (data, type, row) {
                    // Render Avatar + Tên
                    let bg = row.role === 'Admin' ? '212529' : '3b7ddd';
                    return `
                            <div class="d-flex align-items-center">
                                <img src="https://ui-avatars.com/api/?name=${data}&background=${bg}&color=fff" class="rounded-circle me-2" width="35">
                                <span class="fw-bold text-dark">${data}</span>
                            </div>
                        `;
                }
            },
            { data: 'email' },
            {
                data: 'role',
                render: function (data) {
                    return data === 'Admin'
                        ? `<span class="badge bg-primary">Admin</span>`
                        : `<span class="badge bg-light text-dark border">User</span>`;
                }
            },
            {
                data: 'status',
                render: function (data) {
                    return data === 'Active'
                        ? `<span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3">Active</span>`
                        : `<span class="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3">Banned</span>`;
                }
            },
            { data: 'joinDate' },
            {
                data: null, // Cột hành động
                className: "text-end",
                render: function (data, type, row) {
                    return `
                            <a class="btn btn-sm btn-light text-primary me-1" title="Sửa" onclick="editUser('${row.name}')" href="/admin/editUser.html"><i class="fas fa-edit"></i></a>
                            <button class="btn btn-sm btn-light text-danger" title="Xóa/Khóa" onclick="deleteUser(${row.id}, '${row.name}')"><i class="fas fa-trash-alt"></i></button>
                        `;
                }
            }
        ],

        // 3. VIỆT HÓA GIAO DIỆN (Để nó ra tiếng Việt thay vì tiếng Anh)
        language: {
            search: "Tìm kiếm nhanh:",
            lengthMenu: "Hiển thị _MENU_ dòng",
            info: "Đang hiện _START_ đến _END_ trong tổng _TOTAL_ người",
            infoEmpty: "Không có dữ liệu",
            zeroRecords: "Không tìm thấy kết quả nào khớp",
            paginate: {
                first: "Đầu",
                last: "Cuối",
                next: "Sau",
                previous: "Trước"
            }
        },

        // Cấu hình giao diện Bootstrap 5
        pageLength: 10, // Mặc định hiện 10 dòng
        lengthMenu: [5, 10, 20, 50], // Các mức chọn hiển thị
        ordering: true, // Cho phép sắp xếp cột
        responsive: true
    });
});

// --- HÀM XỬ LÝ NÚT BẤM (SWEETALERT2) ---

function deleteUser(id, name) {
    Swal.fire({
        title: `Xóa user ${name}?`,
        text: "Hành động này không thể hoàn tác!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa luôn',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            // Xử lý xóa dòng trong bảng thật luôn
            var table = $('#tableUser').DataTable();
            // Tìm dòng có chứa nút bấm này để xóa (Mô phỏng)
            // Trong thực tế sẽ gọi API delete xong reload bảng
            Swal.fire('Đã xóa!', 'User đã bay màu.', 'success');
        }
    })
}

function editUser(name) {
    Swal.fire('Tính năng Sửa', `Đang mở form sửa cho: ${name}`, 'info');
}

function createNewUser() {
    Swal.fire('Thêm mới', 'Mở popup thêm user ở đây', 'success');
}

// Hàm phụ trợ: Bỏ dấu tiếng Việt để tạo email
function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}