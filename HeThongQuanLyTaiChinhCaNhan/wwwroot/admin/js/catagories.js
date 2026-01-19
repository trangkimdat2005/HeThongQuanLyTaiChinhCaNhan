var table;

$(document).ready(function () {
    // 1. Khởi tạo DataTable trên bảng HTML đã có dữ liệu
    table = $('#tableCategory').DataTable({
        // Không cần 'data' và 'columns' vì đã render bằng Razor

        language: {
            search: "Tìm kiếm:",
            lengthMenu: "Hiện _MENU_",
            info: "Trang _PAGE_ / _PAGES_",
            paginate: { first: "«", last: "»", next: "›", previous: "‹" },
            infoEmpty: "Không có dữ liệu",
            zeroRecords: "Không tìm thấy kết quả phù hợp"
        },
        // Tắt sort cột cuối cùng (Action)
        columnDefs: [
            { orderable: false, targets: -1 }
        ]
    });

    // 2. Xử lý Bộ lọc (Filter)
    $('#filterType').on('change', function () {
        var val = $(this).val();

        // Logic: 
        // Value "Income" -> Tìm chữ "Khoản Thu" trong bảng
        // Value "Expense" -> Tìm chữ "Khoản Chi" trong bảng
        var searchText = val === "Income" ? "Khoản Thu" : (val === "Expense" ? "Khoản Chi" : "");

        // Cột thứ 3 (index 2) là cột Loại
        table.column(2).search(searchText).draw();
    });
});

function deleteCategory(id) {
    Swal.fire({
        title: 'Xóa danh mục?',
        text: "Hành động này không thể hoàn tác!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa luôn',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {

            // 1. Lấy Token bảo mật (Từ dòng @Html.AntiForgeryToken() bạn vừa thêm ở Index)
            var token = $('input[name="__RequestVerificationToken"]').val();

            // 2. Gửi AJAX
            $.ajax({
                url: '/Admin/Categories/Delete',
                type: 'POST',
                data: { id: id }, // Gửi ID dạng Form Data
                headers: { "RequestVerificationToken": token }, // Kèm Token
                success: function (response) {
                    if (response.success) {
                        Swal.fire(
                            'Đã xóa!',
                            response.message,
                            'success'
                        ).then(() => {
                            // Xóa xong thì reload lại trang để cập nhật bảng
                            location.reload();
                        });
                    } else {
                        Swal.fire('Lỗi!', response.message, 'error');
                    }
                },
                error: function () {
                    Swal.fire('Lỗi!', 'Không thể kết nối đến server.', 'error');
                }
            });
        }
    })
}