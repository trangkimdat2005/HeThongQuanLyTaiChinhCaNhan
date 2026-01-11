$(document).ready(function () {

    // 1. XỬ LÝ LIVE PREVIEW (CẬP NHẬT TỨC THÌ)

    // Cập nhật Tên
    $('#catName').on('input', function () {
        var val = $(this).val();
        $('#previewName').text(val || 'Tên danh mục');
    });

    // Cập nhật Loại (Thu/Chi)
    $('input[name="catType"]').on('change', function () {
        var type = $(this).val();
        if (type === 'Income') {
            $('#previewType').text('Thu nhập');
            // Gợi ý màu xanh nếu chọn Thu
            $('#catColor').val('#198754').trigger('input');
        } else {
            $('#previewType').text('Chi tiêu');
            // Gợi ý màu đỏ nếu chọn Chi
            $('#catColor').val('#dc3545').trigger('input');
        }
    });

    // Cập nhật Màu sắc
    $('#catColor').on('input', function () {
        var color = $(this).val();
        $('#previewBox').css('background-color', color);
        $('#colorCode').text(color); // Hiện mã hex bên cạnh
    });

    // Cập nhật Icon
    $('#catIcon').on('change', function () {
        var icon = $(this).val();
        $('#previewIcon').attr('class', 'fas text-white fa-lg ' + icon);
    });


    // 2. XỬ LÝ SUBMIT FORM
    $('#createCategoryForm').on('submit', function (e) {
        e.preventDefault();

        var name = $('#catName').val();
        var type = $('input[name="catType"]:checked').val();

        // Giả lập Loading
        let timerInterval
        Swal.fire({
            title: 'Đang lưu dữ liệu...',
            html: 'Đang tạo danh mục <b>' + name + '</b>',
            timer: 1500,
            timerProgressBar: true,
            didOpen: () => { Swal.showLoading() },
        }).then((result) => {
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Đã thêm danh mục mới vào hệ thống.',
                showCancelButton: true,
                confirmButtonText: 'Về danh sách',
                cancelButtonText: 'Thêm tiếp'
            }).then((res) => {
                if (res.isConfirmed) {
                    window.location.href = '/admin/categories.html';
                } else {
                    resetForm();
                }
            })
        });
    });
});

// Hàm Reset
function resetForm() {
    $('#createCategoryForm')[0].reset();
    // Reset về mặc định
    $('#previewName').text('Tên danh mục');
    $('#previewType').text('Chi tiêu');
    $('#catColor').val('#dc3545').trigger('input');
    $('#catIcon').val('fa-utensils').trigger('change');
}