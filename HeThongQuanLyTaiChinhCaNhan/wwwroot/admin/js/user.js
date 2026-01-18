$(document).ready(function () {
    // Kích hoạt DataTables cho bảng đã có sẵn HTML
    $('#tableUser').DataTable({
        // Không cần truyền "data" hay "columns" nữa

        // Cấu hình ngôn ngữ tiếng Việt
        language: {
            search: "Tìm kiếm nhanh:",
            lengthMenu: "Hiển thị _MENU_ dòng",
            info: "Đang hiện _START_ đến _END_ trong tổng _TOTAL_ người",
            infoEmpty: "Không có dữ liệu",
            zeroRecords: "Không tìm thấy kết quả nào khớp",
            paginate: { first: "Đầu", last: "Cuối", next: "Sau", previous: "Trước" }
        },
        pageLength: 10,
        lengthMenu: [5, 10, 20, 50],
        ordering: true,     // Cho phép sắp xếp
        responsive: true,   // Cho phép co giãn trên mobile

        // Tắt sắp xếp ở cột cuối cùng (Cột hành động) cho đẹp
        columnDefs: [
            { orderable: false, targets: -1 }
        ]
    });
});

// --- GIỮ NGUYÊN HÀM XỬ LÝ NÚT XÓA ---
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
            // Sau này gọi API xóa thật ở đây
            // $.ajax({ url: '/Admin/Users/Delete/' + id ... });

            Swal.fire('Đã xóa!', 'User đã bay màu.', 'success');
        }
    })
}