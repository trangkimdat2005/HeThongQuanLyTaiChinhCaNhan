// 1. MOCK DATA
var mockCategories = [
    // Khoản Chi (Expense)
    { id: 1, name: "Ăn uống", type: "Expense", icon: "fa-utensils", color: "#e74a3b" },
    { id: 2, name: "Di chuyển", type: "Expense", icon: "fa-car", color: "#f6c23e" },
    { id: 3, name: "Mua sắm", type: "Expense", icon: "fa-shopping-cart", color: "#6f42c1" },
    { id: 4, name: "Hóa đơn", type: "Expense", icon: "fa-file-invoice", color: "#4e73df" },
    { id: 5, name: "Y tế", type: "Expense", icon: "fa-pills", color: "#1cc88a" },

    // Khoản Thu (Income)
    { id: 6, name: "Lương", type: "Income", icon: "fa-money-bill", color: "#1cc88a" },
    { id: 7, name: "Thưởng", type: "Income", icon: "fa-gift", color: "#36b9cc" },
    { id: 8, name: "Đầu tư", type: "Income", icon: "fa-chart-line", color: "#f6c23e" }
];

var filterType = 'Expense'; // Mặc định hiển thị Chi tiêu trước
var modalInstance;

$(document).ready(function () {
    renderCategories();
});

// 2. RENDER
function renderCategories() {
    // Lọc data theo Tab hiện tại
    var filtered = mockCategories.filter(c => c.type === filterType);
    var html = '';

    if (filtered.length === 0) {
        html = `<div class="col-12 text-center py-5 text-muted">Chưa có danh mục nào. Hãy tạo mới!</div>`;
    } else {
        filtered.forEach(c => {
            html += `
            <div class="col-xl-3 col-md-4 col-sm-6">
                <div class="card category-card shadow-sm h-100">
                    <div class="card-body d-flex align-items-center justify-content-between p-3">
                        <div class="d-flex align-items-center">
                            <div class="cat-icon-md me-3 shadow-sm" style="background-color: ${c.color}">
                                <i class="fas ${c.icon}"></i>
                            </div>
                            <div class="fw-bold text-dark text-truncate" style="max-width: 110px;">
                                ${c.name}
                            </div>
                        </div>
                        
                        <div class="dropdown">
                            <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                                <li><a class="dropdown-item" href="#" onclick="openCategoryModal('edit', ${c.id})">Sửa</a></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="deleteCategory(${c.id})">Xóa</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            `;
        });
    }

    $('#categoryList').html(html);
}

// 3. MODAL & PREVIEW
function openCategoryModal(mode, id = null) {
    var myModalEl = document.getElementById('categoryModal');
    modalInstance = new bootstrap.Modal(myModalEl);

    // Set loại danh mục dựa trên Tab đang đứng
    $('#catType').val(filterType);

    if (mode === 'add') {
        $('#modalTitle').text(`Tạo ${filterType === 'Expense' ? 'Khoản Chi' : 'Khoản Thu'} Mới`);
        $('#catID').val('');
        $('#catName').val('');

        // Mặc định màu sắc icon theo loại
        if (filterType === 'Expense') {
            $('#catIcon').val('fa-utensils');
            $('#catColor').val('#e74a3b');
        } else {
            $('#catIcon').val('fa-money-bill');
            $('#catColor').val('#1cc88a');
        }
    } else {
        var item = mockCategories.find(x => x.id === id);
        if (item) {
            $('#modalTitle').text('Cập Nhật Danh Mục');
            $('#catID').val(item.id);
            $('#catName').val(item.name);
            $('#catIcon').val(item.icon);
            $('#catColor').val(item.color);
        }
    }

    updatePreview();
    modalInstance.show();
}

// Cập nhật icon xem trước khi nhập form
function updatePreview() {
    var color = $('#catColor').val();
    var icon = $('#catIcon').val();

    $('#iconPreviewBox').css('background-color', color);
    $('#iconPreview').attr('class', 'fas fs-3 ' + icon);
}

// 4. SUBMIT FORM
$('#categoryForm').on('submit', function (e) {
    e.preventDefault();
    modalInstance.hide();

    var action = $('#catID').val() ? 'Cập nhật' : 'Tạo mới';

    Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: `Đã ${action} danh mục thành công!`,
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        // Reload data demo
        renderCategories();
    });
});

// 5. DELETE
function deleteCategory(id) {
    Swal.fire({
        title: 'Xóa danh mục?',
        text: "Các giao dịch cũ thuộc danh mục này sẽ hiển thị là 'Chưa phân loại'.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Xóa ngay'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Đã xóa', '', 'success');
        }
    })
}