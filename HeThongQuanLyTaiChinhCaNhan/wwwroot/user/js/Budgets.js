// 1. MOCK DATA (Giả lập dữ liệu)
// Danh mục (Chỉ lấy Expense)
var mockCategories = [
    { id: 3, name: "Ăn uống", icon: "fa-utensils", color: "#dc3545" },
    { id: 4, name: "Di chuyển", icon: "fa-car", color: "#fd7e14" },
    { id: 5, name: "Mua sắm", icon: "fa-shopping-cart", color: "#6f42c1" },
    { id: 6, name: "Hóa đơn", icon: "fa-file-invoice", color: "#17a2b8" }
];

// Ngân sách hiện tại
// Lưu ý: 'spent' là số liệu giả lập (Thực tế phải query SUM từ bảng Transactions)
var mockBudgets = [
    {
        id: 1,
        catID: 3,
        amount: 3000000,
        spent: 2600000, // Đã tiêu 2.6tr / 3tr -> Sắp vỡ
        startDate: "2026-01-01",
        endDate: "2026-01-31"
    },
    {
        id: 2,
        catID: 4,
        amount: 1500000,
        spent: 400000, // Đã tiêu 400k / 1.5tr -> An toàn
        startDate: "2026-01-01",
        endDate: "2026-01-31"
    },
    {
        id: 3,
        catID: 6,
        amount: 1000000,
        spent: 1200000, // Đã tiêu 1.2tr / 1tr -> Vỡ kế hoạch (Over budget)
        startDate: "2026-01-01",
        endDate: "2026-01-31"
    }
];

var modalInstance;

$(document).ready(function () {
    renderCategoryOptions();
    renderBudgets();
});

// --- RENDER GIAO DIỆN ---

function renderBudgets() {
    var html = '';

    mockBudgets.forEach(b => {
        // Lấy thông tin danh mục
        var cat = mockCategories.find(c => c.id === b.catID);

        // Tính toán phần trăm
        var percent = Math.round((b.spent / b.amount) * 100);
        var displayPercent = percent > 100 ? 100 : percent; // Bar không dài quá 100%

        // Xác định màu sắc trạng thái
        var colorClass = 'bg-success';
        var statusText = 'An toàn';
        var textColor = 'text-success';

        if (percent >= 50 && percent < 80) {
            colorClass = 'bg-warning';
            statusText = 'Cần chú ý';
            textColor = 'text-warning';
        } else if (percent >= 80 && percent <= 100) {
            colorClass = 'bg-danger';
            statusText = 'Sắp hết';
            textColor = 'text-danger';
        } else if (percent > 100) {
            colorClass = 'bg-danger'; // Vẫn đỏ nhưng đậm hơn logic dưới
            statusText = `Vượt quá ${Math.abs(b.amount - b.spent).toLocaleString()}đ`;
            textColor = 'text-danger fw-bold';
        }

        // Format ngày
        var sDate = new Date(b.startDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        var eDate = new Date(b.endDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

        html += `
        <div class="col-xl-4 col-md-6">
            <div class="card budget-card shadow-sm h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="d-flex align-items-center">
                            <div class="cat-icon-lg me-3 shadow-sm" style="background-color: ${cat.color}">
                                <i class="fas ${cat.icon}"></i>
                            </div>
                            <div>
                                <h6 class="fw-bold text-dark mb-0">${cat.name}</h6>
                                <small class="text-muted">${sDate} - ${eDate}</small>
                            </div>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-light btn-sm rounded-circle" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                            <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                                <li><a class="dropdown-item" href="#" onclick="openBudgetModal('edit', ${b.id})">Sửa hạn mức</a></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="deleteBudget(${b.id})">Xóa ngân sách</a></li>
                            </ul>
                        </div>
                    </div>

                    <div class="mb-2 d-flex justify-content-between fw-bold small">
                        <span class="text-muted">Đã dùng: ${b.spent.toLocaleString()}đ</span>
                        <span class="${textColor}">${percent}%</span>
                    </div>
                    <div class="progress mb-3">
                        <div class="progress-bar ${colorClass} progress-bar-striped" role="progressbar" style="width: ${displayPercent}%"></div>
                    </div>

                    <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                        <div class="small">
                            <span class="text-muted">Hạn mức:</span>
                            <span class="fw-bold text-dark">${b.amount.toLocaleString()}đ</span>
                        </div>
                        <div class="small fw-bold ${textColor}">
                            ${statusText}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    });

    $('#budgetList').html(html);
}

// Render Dropdown chọn danh mục trong Modal
function renderCategoryOptions() {
    var opts = '<option value="">-- Chọn danh mục --</option>';
    mockCategories.forEach(c => {
        opts += `<option value="${c.id}">${c.name}</option>`;
    });
    $('#budgetCategory').html(opts);
}


// --- XỬ LÝ MODAL ---

function openBudgetModal(mode, id = null) {
    var myModalEl = document.getElementById('budgetModal');
    modalInstance = new bootstrap.Modal(myModalEl);

    if (mode === 'add') {
        $('#modalTitle').text('Tạo Ngân Sách Mới');
        $('#budgetForm')[0].reset();
        $('#budgetID').val('');
        setQuickDate('thisMonth'); // Mặc định chọn tháng này
    } else {
        var item = mockBudgets.find(b => b.id === id);
        if (item) {
            $('#modalTitle').text('Cập Nhật Ngân Sách');
            $('#budgetID').val(item.id);
            $('#budgetCategory').val(item.catID);
            $('#budgetAmount').val(item.amount);
            $('#startDate').val(item.startDate);
            $('#endDate').val(item.endDate);
        }
    }
    modalInstance.show();
}

// Helper chọn ngày nhanh
function setQuickDate(type) {
    var date = new Date();
    var firstDay, lastDay;

    if (type === 'thisMonth') {
        firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    } else if (type === 'nextMonth') {
        firstDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        lastDay = new Date(date.getFullYear(), date.getMonth() + 2, 0);
    }

    // Format YYYY-MM-DD
    $('#startDate').val(firstDay.toISOString().split('T')[0]);
    $('#endDate').val(lastDay.toISOString().split('T')[0]);
}

// Submit Form
$('#budgetForm').on('submit', function (e) {
    e.preventDefault();
    modalInstance.hide();

    Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Ngân sách đã được thiết lập!',
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        location.reload();
    });
});

// Xóa
function deleteBudget(id) {
    Swal.fire({
        title: 'Xóa ngân sách này?',
        text: "Bạn sẽ không còn theo dõi chi tiêu cho danh mục này nữa.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Xóa'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Đã xóa!', '', 'success');
        }
    })
}