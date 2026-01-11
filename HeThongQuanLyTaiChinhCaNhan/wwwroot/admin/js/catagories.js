// Dữ liệu giả mô phỏng bảng Categories trong DB
var mockCategories = [
    { CategoryID: 1, CategoryName: "Lương", Type: "Income", Icon: "fa-money-bill", Color: "#28a745" },
    { CategoryID: 2, CategoryName: "Thưởng", Type: "Income", Icon: "fa-gift", Color: "#20c997" },
    { CategoryID: 3, CategoryName: "Ăn uống", Type: "Expense", Icon: "fa-utensils", Color: "#dc3545" },
    { CategoryID: 4, CategoryName: "Di chuyển", Type: "Expense", Icon: "fa-car", Color: "#fd7e14" },
    { CategoryID: 5, CategoryName: "Mua sắm", Type: "Expense", Icon: "fa-shopping-cart", Color: "#6f42c1" },
    { CategoryID: 6, CategoryName: "Hóa đơn", Type: "Expense", Icon: "fa-file-invoice", Color: "#17a2b8" }
];

var table;
var modalInstance;

$(document).ready(function () {

    // 1. Khởi tạo DataTable
    table = $('#tableCategory').DataTable({
        data: mockCategories,
        columns: [
            {
                data: 'CategoryID',
                render: function (data) { return `<span class="text-muted small">#${data}</span>`; }
            },
            {
                data: 'CategoryName',
                render: function (data, type, row) {
                    // Render Icon bên cạnh Tên
                    return `
                        <div class="d-flex align-items-center">
                            <div class="icon-box me-2" style="background-color: ${row.Color}">
                                <i class="fas ${row.Icon}"></i>
                            </div>
                            <span class="fw-bold">${data}</span>
                        </div>
                    `;
                }
            },
            {
                data: 'Type',
                render: function (data) {
                    if (data === 'Income') return '<span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3">Khoản Thu</span>';
                    return '<span class="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3">Khoản Chi</span>';
                }
            },
            {
                data: 'Color',
                render: function (data) {
                    return `<div class="d-flex align-items-center"><span class="rounded-circle border me-2" style="width:15px;height:15px;background:${data}"></span><span class="small text-muted">${data}</span></div>`;
                }
            },
            {
                data: 'Icon',
                render: function (data) { return `<code class="small text-muted">${data}</code>`; }
            },
            {
                data: null,
                className: "text-end",
                render: function (data, type, row) {
                    return `
                        <a class="btn btn-sm btn-light text-primary me-1" href="/admin/editCatelogi.html"><i class="fas fa-edit"></i></a>
                        <button class="btn btn-sm btn-light text-danger" onclick="deleteCategory(${row.CategoryID})"><i class="fas fa-trash-alt"></i></button>
                    `;
                }
            }
        ],
        language: { search: "Tìm kiếm:", lengthMenu: "Hiện _MENU_", info: "Trang _PAGE_ / _PAGES_", paginate: { first: "«", last: "»", next: "›", previous: "‹" } }
    });

    // 2. Xử lý Bộ lọc (Filter)
    $('#filterType').on('change', function () {
        var val = $(this).val();
        // Logic: Map value 'Income' -> Text hiển thị 'Khoản Thu' để search
        var searchText = val === "Income" ? "Khoản Thu" : (val === "Expense" ? "Khoản Chi" : "");
        table.column(2).search(searchText).draw();
    });

    // 3. Xử lý Live Preview (Thay đổi khi nhập liệu)
    $('#catName').on('input', function () {
        $('#livePreviewText').text($(this).val() || 'Tên danh mục');
    });

    $('#catColor').on('input', function () {
        $('#livePreviewBox').css('background-color', $(this).val());
    });

    $('#catIcon').on('change', function () {
        var iconClass = $(this).val();
        $('#iconDisplay').attr('class', 'fas ' + iconClass); // Update icon nhỏ ở input
        $('#livePreviewBox i').attr('class', 'fas text-white ' + iconClass); // Update icon to ở preview
    });
});

// --- CÁC HÀM GỌI TỪ HTML ---

function openModal(mode, id = null) {
    var myModalEl = document.getElementById('categoryModal');
    modalInstance = new bootstrap.Modal(myModalEl);

    if (mode === 'add') {
        $('#modalTitle').text('Thêm Danh Mục Mới');
        $('#categoryForm')[0].reset(); // Reset form
        $('#catID').val('');
        $('#catColor').val('#563d7c').trigger('input'); // Reset màu
        $('#catIcon').val('fa-question').trigger('change'); // Reset icon
        $('#livePreviewText').text('Tên danh mục');
    } else {
        $('#modalTitle').text('Cập Nhật Danh Mục');
        // Tìm data cũ
        var item = mockCategories.find(x => x.CategoryID === id);
        if (item) {
            $('#catID').val(item.CategoryID);
            $('#catName').val(item.CategoryName).trigger('input');
            $('#catColor').val(item.Color).trigger('input');
            $('#catIcon').val(item.Icon).trigger('change');

            if (item.Type === 'Income') $('#typeIncome').prop('checked', true);
            else $('#typeExpense').prop('checked', true);
        }
    }
    modalInstance.show();
}

function saveCategory() {
    var name = $('#catName').val();
    if (!name) {
        Swal.fire('Lỗi', 'Vui lòng nhập tên danh mục!', 'warning');
        return;
    }

    modalInstance.hide();

    // Giả lập lưu thành công
    Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Dữ liệu đã được lưu vào CSDL',
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        // location.reload(); // Bỏ comment dòng này để reload trang thật
    });
}

function deleteCategory(id) {
    Swal.fire({
        title: 'Xóa danh mục?',
        text: "Lưu ý: Các giao dịch cũ thuộc danh mục này có thể bị lỗi hiển thị!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Xóa luôn'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Đã xóa!', '', 'success');
        }
    })
}