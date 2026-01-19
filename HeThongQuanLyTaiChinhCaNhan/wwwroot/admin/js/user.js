$(document).ready(function () {
    // Kích hoạt DataTables
    $('#tableUser').DataTable({
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
        ordering: true,
        responsive: true,
        columnDefs: [
            { orderable: false, targets: -1 } // Tắt sort cột hành động
        ]
    });
});

// --- CHỈ DÙNG 1 HÀM NÀY THÔI ---
function deleteUser(id, fullName) {
    Swal.fire({
        title: 'Xóa người dùng?',
        html: `Bạn có chắc muốn xóa <b>${fullName}</b> không?<br><small class="text-danger">Hành động này không thể hoàn tác!</small>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa ngay',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {

            // Lấy Token từ View (Giờ đã có nhờ bước 1)
            var token = $('input[name="__RequestVerificationToken"]').val();

            Swal.fire({
                title: 'Đang xử lý...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading() }
            });

            $.ajax({
                url: '/Admin/Users/Delete',
                type: 'POST',
                data: { id: id },
                headers: { "RequestVerificationToken": token },
                success: function (res) {
                    if (res.success) {
                        Swal.fire(
                            'Đã xóa!',
                            res.message,
                            'success'
                        ).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire('Không thể xóa', res.message, 'error');
                    }
                },
                error: function (xhr, status, error) {
                    // In lỗi ra console để debug nếu cần
                    console.error(xhr.responseText);
                    Swal.fire('Lỗi', 'Không kết nối được server (Code: ' + xhr.status + ')', 'error');
                }
            });
        }
    })
}