$(document).ready(function () {
    const icons = {
        Expense: ['fa-utensils', 'fa-shopping-cart', 'fa-home', 'fa-car', 'fa-pills', 'fa-bus', 'fa-coffee', 'fa-film', 'fa-tshirt', 'fa-graduation-cap'],
        Income: ['fa-money-bill-wave', 'fa-gift', 'fa-chart-line', 'fa-wallet', 'fa-hand-holding-usd', 'fa-coins', 'fa-piggy-bank', 'fa-briefcase']
    };

    function renderIcons(type) {
        const $container = $('#iconList');
        $container.empty();
        const currentIcon = $('#catIcon').val();

        icons[type].forEach(icon => {
            const isActive = icon === currentIcon ? 'active' : '';
            $container.append(`
                <div class="col">
                    <div class="icon-item ${isActive}" data-icon="${icon}">
                        <i class="fas ${icon} fa-xl"></i>
                    </div>
                </div>
            `);
        });
    }

    function updateInterface() {
        const type = $('input[name="Type"]:checked').val();
        const color = type === 'Expense' ? '#dc3545' : '#198754';

        // Cập nhật biến CSS để đổi màu theme
        document.documentElement.style.setProperty('--theme-color', color);

        // Cập nhật text Preview
        $('#previewTypeText').text(type === 'Expense' ? 'Khoản chi' : 'Khoản thu');

        const $amount = $('#previewAmount');
        if (type === 'Expense') {
            $amount.text('- 50.000 đ').addClass('text-danger').removeClass('text-success');
        } else {
            $amount.text('+ 50.000 đ').addClass('text-success').removeClass('text-danger');
        }

        // Đồng bộ màu sắc nếu người dùng chưa chọn màu riêng
        $('#catColor').val(color).trigger('input');

        // Render lại danh sách icon tương ứng
        renderIcons(type);
    }

    // Sự kiện đổi loại giao dịch
    $(document).on('change', 'input[name="Type"]', function () {
        updateInterface();
    });

    // Sự kiện chọn Icon
    $(document).on('click', '.icon-item', function () {
        $('.icon-item').removeClass('active');
        $(this).addClass('active');
        const iconClass = $(this).data('icon');
        $('#catIcon').val(iconClass);
        $('#previewIcon').attr('class', `fas ${iconClass} text-white fa-lg`);
    });

    // Sự kiện nhập tên
    $('#catName').on('input', function () {
        $('#previewName').text($(this).val() || 'Tên danh mục');
    });

    // Sự kiện chọn màu
    $('#catColor').on('input', function () {
        const color = $(this).val();
        $('#colorCode').val(color.toUpperCase());
        $('#previewBox').css('background-color', color);
    });

    // Submit Form
    $('#createCategoryForm').on('submit', function (e) {
        e.preventDefault();

        const categoryData = {
            CategoryName: $('#catName').val(),
            Type: $('input[name="Type"]:checked').val(),
            Color: $('#catColor').val(),
            Icon: $('#catIcon').val()
        };

        const token = $('input[name="__RequestVerificationToken"]').val();

        Swal.fire({
            title: 'Đang xử lý...',
            didOpen: () => { Swal.showLoading() }
        });

        $.ajax({
            url: '/Admin/Categories/Add',
            type: 'POST',
            contentType: 'application/json',
            headers: { "RequestVerificationToken": token },
            data: JSON.stringify(categoryData),
            success: function (res) {
                if (res.success) {
                    Swal.fire('Thành công!', res.message, 'success').then(() => {
                        window.location.href = '/Admin/Categories';
                    });
                } else {
                    Swal.fire('Lỗi!', res.message, 'error');
                }
            }
        });
    });

    // Khởi tạo lần đầu
    updateInterface();
});

function resetForm() {
    $('#createCategoryForm')[0].reset();
    $('#typeExpense').prop('checked', true).trigger('change');
    $('#catName').trigger('input');
}