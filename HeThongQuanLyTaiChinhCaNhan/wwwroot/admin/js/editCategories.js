$(document).ready(function () {

    // 1. LOGIC LIVE PREVIEW
    function updatePreview() {
        var name = $('#catName').val();
        var color = $('#catColor').val();
        var icon = $('#catIcon').val();

        // Sửa: Lấy Type chuẩn xác bằng ID
        var type = $('#typeIncome').is(':checked') ? 'Income' : 'Expense';

        $('#previewName').text(name || 'Chưa đặt tên');
        $('#previewBox').css('background-color', color);
        $('#colorCode').text(color);
        $('#previewIcon').attr('class', 'fas text-white fa-lg ' + icon);

        if (type === 'Income') {
            $('#previewType').text('Thu nhập');
        } else {
            $('#previewType').text('Chi tiêu');
        }
    }

    // Gắn sự kiện
    $('#catName, #catColor, #catIcon, input[name="Type"]').on('input change', updatePreview);

    // Chạy 1 lần đầu tiên
    updatePreview();


    // 2. XỬ LÝ SUBMIT FORM
    $('#editCategoryForm').on('submit', function (e) {
        e.preventDefault();

        // Lấy ID và ép kiểu về số nguyên
        var idVal = $('#catID').val();
        var id = parseInt(idVal); // <--- Ép kiểu số

        if (!id || id === 0) {
            Swal.fire('Lỗi', 'Không tìm thấy ID danh mục. Hãy tải lại trang!', 'error');
            return;
        }

        var selectedType = $('#typeIncome').is(':checked') ? 'Income' : 'Expense';

        var categoryData = {
            CategoryId: id, // <--- Gửi số nguyên
            CategoryName: $('#catName').val(),
            Type: selectedType,
            Color: $('#catColor').val(),
            Icon: $('#catIcon').val()
        };

        console.log("Dữ liệu chuẩn bị gửi:", categoryData); // Check console lần nữa xem CategoryId có số chưa

        var token = $('input[name="__RequestVerificationToken"]').val();

        Swal.fire({
            title: 'Đang cập nhật...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading() }
        });

        $.ajax({
            url: '/Admin/Categories/Edit/' + id,
            type: 'POST',
            contentType: 'application/json',
            headers: { "RequestVerificationToken": token },
            data: JSON.stringify(categoryData),
            success: function (response) {
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Đã lưu!',
                        text: response.message,
                        showConfirmButton: true,
                        confirmButtonText: 'Về danh sách'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = '/Admin/Categories';
                        }
                    });
                } else {
                    Swal.fire('Lỗi!', response.message, 'error');
                }
            },
            error: function () {
                Swal.fire('Lỗi!', 'Không thể kết nối server.', 'error');
            }
        });
    });
});