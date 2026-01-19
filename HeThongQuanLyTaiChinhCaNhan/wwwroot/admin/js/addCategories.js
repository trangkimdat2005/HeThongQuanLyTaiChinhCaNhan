$(document).ready(function () {

    // --- 1. PHẦN LOGIC PREVIEW (GIỮ NGUYÊN ĐỂ GIAO DIỆN ĐẸP) ---
    $('#catName').on('input', function () {
        $('#previewName').text($(this).val() || 'Tên danh mục');
    });

    // Sự kiện đổi loại (Thu/Chi) để cập nhật Preview
    $('input[name="Type"]').on('change', function () {
        var type = $(this).val();
        if (type === 'Income') {
            $('#previewType').text('Thu nhập');
            $('#catColor').val('#198754').trigger('input');
        } else {
            $('#previewType').text('Chi tiêu');
            $('#catColor').val('#dc3545').trigger('input');
        }
    });

    $('#catColor').on('input', function () {
        var color = $(this).val();
        $('#previewBox').css('background-color', color);
        $('#colorCode').text(color);
    });

    $('#catIcon').on('change', function () {
        var icon = $(this).val();
        $('#previewIcon').attr('class', 'fas text-white fa-lg ' + icon);
    });


    // --- 2. XỬ LÝ SUBMIT FORM AJAX (QUAN TRỌNG) ---
    $('#createCategoryForm').on('submit', function (e) {
        e.preventDefault();

        // --- FIX LỖI "TYPE REQUIRED" ---
        // Thay vì lấy theo name, ta kiểm tra ID trực tiếp.
        // Nếu ô Income đang được tích -> Type là 'Income', ngược lại là 'Expense'
        var selectedType = $('#typeIncome').is(':checked') ? 'Income' : 'Expense';

        // Gom dữ liệu thành Object JSON
        var categoryData = {
            CategoryName: $('#catName').val(),
            Type: selectedType, // <-- Đã sửa: dùng biến selectedType ở trên
            Color: $('#catColor').val(),
            Icon: $('#catIcon').val()
        };

        // Lấy Token chống giả mạo
        var token = $('input[name="__RequestVerificationToken"]').val();

        // Hiển thị Loading
        Swal.fire({
            title: 'Đang lưu...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading() }
        });

        // Gửi AJAX
        $.ajax({
            url: '/Admin/Categories/Add',
            type: 'POST',
            contentType: 'application/json',
            headers: { "RequestVerificationToken": token }, // Gửi kèm token header
            data: JSON.stringify(categoryData),
            success: function (response) {
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công!',
                        text: response.message,
                        showCancelButton: true,
                        confirmButtonText: 'Về danh sách',
                        cancelButtonText: 'Thêm tiếp'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = '/Admin/Categories';
                        } else {
                            resetForm();
                        }
                    });
                } else {
                    // Hiện lỗi chi tiết từ Controller trả về
                    Swal.fire('Lỗi!', response.message, 'error');
                }
            },
            error: function () {
                Swal.fire('Lỗi!', 'Không thể kết nối đến server.', 'error');
            }
        });
    });
});

// Hàm Reset Form sau khi thêm thành công
function resetForm() {
    $('#createCategoryForm')[0].reset();
    $('#previewName').text('Tên danh mục');
    $('#catColor').val('#dc3545').trigger('input');
    $('#catIcon').val('fa-utensils').trigger('change');
    // Reset lại radio về mặc định Expense
    $('#typeExpense').prop('checked', true);
}