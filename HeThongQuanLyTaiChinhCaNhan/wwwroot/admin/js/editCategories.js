$(document).ready(function () {

    // 1. MOCK DATA (GIẢ LẬP DỮ LIỆU TỪ DB ĐỔ VỀ)
    // Trong thực tế: Bạn sẽ lấy ID từ URL -> Gọi API -> Nhận JSON này
    var mockData = {
        CategoryID: 3,
        CategoryName: "Ăn uống",
        Type: "Expense",
        Icon: "fa-utensils",
        Color: "#dc3545"
    };

    // 2. HÀM ĐỔ DỮ LIỆU VÀO FORM
    function loadData() {
        // Điền dữ liệu vào input
        $('#headerCatName').text(mockData.CategoryName);
        $('#catID').val(mockData.CategoryID);
        $('#catName').val(mockData.CategoryName);
        $('#catColor').val(mockData.Color);
        $('#colorCode').text(mockData.Color);
        $('#catIcon').val(mockData.Icon);

        // Check radio button dựa theo Type
        if (mockData.Type === 'Income') {
            $('#typeIncome').prop('checked', true);
        } else {
            $('#typeExpense').prop('checked', true);
        }

        // Kích hoạt sự kiện để Live Preview cập nhật theo dữ liệu vừa đổ
        updatePreview();
    }

    // 3. LOGIC LIVE PREVIEW (CẬP NHẬT KHI SỬA)
    function updatePreview() {
        // Lấy giá trị hiện tại trên form
        var name = $('#catName').val();
        var color = $('#catColor').val();
        var icon = $('#catIcon').val();
        var type = $('input[name="catType"]:checked').val();

        // Update UI cột trái
        $('#previewName').text(name || 'Chưa đặt tên');
        $('#previewBox').css('background-color', color);
        $('#previewIcon').attr('class', 'fas text-white fa-lg ' + icon);

        if (type === 'Income') {
            $('#previewType').text('Thu nhập').addClass('text-success').removeClass('text-danger');
        } else {
            $('#previewType').text('Chi tiêu').addClass('text-danger').removeClass('text-success');
        }
    }

    // Gắn sự kiện: Cứ sửa là update preview
    $('#catName, #catColor, #catIcon, input[name="catType"]').on('input change', function () {
        updatePreview();
        // Cập nhật mã màu text bên cạnh input
        if (this.id === 'catColor') $('#colorCode').text($(this).val());
    });

    // --- CHẠY HÀM LOAD DATA KHI TRANG VỪA TẢI XONG ---
    loadData();


    // 4. XỬ LÝ SUBMIT FORM UPDATE
    $('#editCategoryForm').on('submit', function (e) {
        e.preventDefault();

        Swal.fire({
            title: 'Đang cập nhật...',
            text: 'UPDATE Categories SET ... WHERE CategoryID = ' + mockData.CategoryID,
            timer: 1500,
            timerProgressBar: true,
            didOpen: () => { Swal.showLoading() },
        }).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Đã lưu thay đổi!',
                text: 'Thông tin danh mục đã được cập nhật.',
                confirmButtonText: 'Quay lại danh sách'
            }).then((res) => {
                if (res.isConfirmed) {
                    window.location.href = '/admin/categories.html';
                }
            })
        });
    });
});