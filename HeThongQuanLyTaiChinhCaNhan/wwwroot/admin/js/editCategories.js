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

    function updateInterface(isInitial = false) {
        const type = $('input[name="Type"]:checked').val();
        const color = isInitial ? $('#catColor').val() : (type === 'Expense' ? '#dc3545' : '#198754');

        document.documentElement.style.setProperty('--theme-color', type === 'Expense' ? '#dc3545' : '#198754');
        $('#previewTypeText').text(type === 'Expense' ? 'Khoản chi' : 'Khoản thu');

        const $amount = $('#previewAmount');
        if (type === 'Expense') {
            $amount.text('- 50.000 đ').addClass('text-danger').removeClass('text-success');
        } else {
            $amount.text('+ 50.000 đ').addClass('text-success').removeClass('text-danger');
        }

        if (!isInitial) {
            $('#catColor').val(color).trigger('input');
        }
        renderIcons(type);
    }

    $(document).on('change', 'input[name="Type"]', function () {
        updateInterface();
    });

    $(document).on('click', '.icon-item', function () {
        $('.icon-item').removeClass('active');
        $(this).addClass('active');
        const iconClass = $(this).data('icon');
        $('#catIcon').val(iconClass);
        $('#previewIcon').attr('class', `fas ${iconClass} text-white fa-lg`);
    });

    $('#catName').on('input', function () {
        $('#previewName').text($(this).val() || 'Tên danh mục');
    });

    $('#catColor').on('input', function () {
        const color = $(this).val();
        $('#colorCode').val(color.toUpperCase());
        $('#previewBox').css('background-color', color);
    });

    $('#editCategoryForm').on('submit', function (e) {
        e.preventDefault();
        const id = parseInt($('#catID').val());

        const categoryData = {
            CategoryId: id,
            CategoryName: $('#catName').val(),
            Type: $('input[name="Type"]:checked').val(),
            Color: $('#catColor').val(),
            Icon: $('#catIcon').val()
        };

        const token = $('input[name="__RequestVerificationToken"]').val();

        Swal.fire({ title: 'Đang cập nhật...', didOpen: () => { Swal.showLoading() } });

        $.ajax({
            url: '/Admin/Categories/Edit/' + id,
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

    // Khởi tạo lần đầu: Giữ nguyên màu từ Database
    updateInterface(true);
});