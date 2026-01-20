const { get, data } = require("jquery");

// ==================== 1. MOCK DATA ====================
var mockWallets = [
    { id: 1, name: "Tiền mặt" },
    { id: 2, name: "Vietcombank" },
    { id: 3, name: "Momo" }
];

// Danh mục chia theo Type
var mockCategories = [
    { id: 1, name: "Lương", type: "Income", icon: "fa-money-bill", color: "#1cc88a" },
    { id: 2, name: "Thưởng", type: "Income", icon: "fa-gift", color: "#20c997" },
    { id: 3, name: "Ăn uống", type: "Expense", icon: "fa-utensils", color: "#e74a3b" },
    { id: 4, name: "Di chuyển", type: "Expense", icon: "fa-car", color: "#f6c23e" },
    { id: 5, name: "Mua sắm", type: "Expense", icon: "fa-shopping-cart", color: "#6f42c1" },
    { id: 6, name: "Hóa đơn", type: "Expense", icon: "fa-file-invoice", color: "#4e73df" }
];

var mockTransactions = [
    { id: 101, date: "2026-01-05", catId: 1, walletId: 2, amount: 15000000, desc: "Nhận lương tháng 1", type: "Income" },
    { id: 102, date: "2026-01-06", catId: 3, walletId: 1, amount: 50000, desc: "Ăn trưa", type: "Expense" },
    { id: 103, date: "2026-01-07", catId: 3, walletId: 1, amount: 450000, desc: "Liên hoan", type: "Expense" },
    { id: 104, date: "2026-01-08", catId: 4, walletId: 1, amount: 100000, desc: "Đổ xăng", type: "Expense" },
    { id: 105, date: "2026-01-10", catId: 6, walletId: 2, amount: 500000, desc: "Tiền điện", type: "Expense" }
];

var table;
var modalInstance;

$(document).ready(function () {
    // 1. Load dữ liệu vào Dropdown (Filter & Modal)
    loadWalletDropdowns();

    // 2. Init DataTable
    table = $('#tableTransaction').DataTable({
        data: mockTransactions,
        columns: [
            {
                data: 'date',
                render: function (data) {
                    var date = new Date(data);
                    return `<span class="fw-bold text-secondary">${date.getDate()}/${date.getMonth() + 1}</span><br><small class="text-muted">${date.getFullYear()}</small>`;
                }
            },
            {
                data: 'catId',
                render: function (data, type, row) {
                    var cat = mockCategories.find(c => c.id === data);
                    return `
                        <div class="d-flex align-items-center">
                            <div class="cat-icon-circle me-2" style="background-color: ${cat.color}">
                                <i class="fas ${cat.icon}"></i>
                            </div>
                            <span class="fw-bold text-dark">${cat.name}</span>
                        </div>
                    `;
                }
            },
            { data: 'desc' },
            {
                data: 'walletId',
                render: function (data) {
                    var w = mockWallets.find(w => w.id === data);
                    return `<span class="badge bg-light text-dark border">${w.name}</span>`;
                }
            },
            {
                data: 'amount',
                className: "text-end pe-3",
                render: function (data, type, row) {
                    var color = row.type === 'Income' ? 'text-success' : 'text-danger';
                    var sign = row.type === 'Income' ? '+' : '-';
                    return `<span class="fw-bold ${color}">${sign} ${data.toLocaleString()} đ</span>`;
                }
            },
            {
                data: null,
                className: "text-end",
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-sm btn-light text-primary me-1" onclick="openTransactionModal('edit', ${row.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-light text-danger" onclick="deleteTransaction(${row.id})"><i class="fas fa-trash-alt"></i></button>
                    `;
                }
            }
        ],
        order: [[0, 'desc']], // Mới nhất lên đầu
        language: { search: "Tìm nhanh:", lengthMenu: "Hiện _MENU_", info: "_START_ - _END_ / _TOTAL_", paginate: { first: "«", last: "»", next: "›", previous: "‹" } }
    });
});

// ==================== FUNCTIONS ====================

// 1. Load Wallets vào Select box
function loadWalletDropdowns() {
    var opts = '<option value="">-- Chọn ví --</option>';
    mockWallets.forEach(w => {
        opts += `<option value="${w.id}">${w.name}</option>`;
    });
    $('#transWallet').html(opts);

    // Load cho Filter
    var filterOpts = '<option value="">Tất cả ví</option>';
    mockWallets.forEach(w => {
        filterOpts += `<option value="${w.id}">${w.name}</option>`;
    });
    $('#filterWallet').html(filterOpts);
}

// 2. Load Categories theo Type (Income/Expense)
function loadCategoriesByType(type) {
    var filteredCats = mockCategories.filter(c => c.type === type);
    var opts = '';
    filteredCats.forEach(c => {
        opts += `<option value="${c.id}">${c.name}</option>`;
    });
    $('#transCategory').html(opts);
}

// 3. Mở Modal (Thêm/Sửa)
function openTransactionModal(mode, id = null) {
    var myModalEl = document.getElementById('transactionModal');
    modalInstance = new bootstrap.Modal(myModalEl);

    if (mode === 'add') {
        $('#modalTitle').text('Thêm Giao Dịch');
        $('#transID').val('');
        $('#transAmount').val('');
        $('#transDesc').val('');
        document.getElementById('transDate').valueAsDate = new Date();

        // Mặc định chọn Expense
        $('#typeExpense').prop('checked', true).trigger('change');

    } else {
        // Edit Mode
        var item = mockTransactions.find(x => x.id === id);
        if (item) {
            $('#modalTitle').text('Sửa Giao Dịch #' + id);
            $('#transID').val(item.id);
            $('#transAmount').val(item.amount);
            $('#transDesc').val(item.desc);
            $('#transDate').val(item.date);
            $('#transWallet').val(item.walletId);

            // Check radio button
            if (item.type === 'Income') {
                $('#typeIncome').prop('checked', true).trigger('change');
            } else {
                $('#typeExpense').prop('checked', true).trigger('change');
            }

            // Sau khi trigger change, category list mới được load lại, rồi mới set value được
            setTimeout(() => {
                $('#transCategory').val(item.catId);
            }, 50);
        }
    }
    modalInstance.show();
}

// 4. Submit Form
$('#transactionForm').on('submit', function (e) {
    e.preventDefault();
    modalInstance.hide();

    // Logic lưu vào DB ở đây (Gọi API)
    Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Giao dịch đã được lưu!',
        timer: 1500,
        showConfirmButton: false
    });
});

// 5. Xóa Giao dịch
function deleteTransaction(id) {
    Swal.fire({
        title: 'Xóa giao dịch này?',
        text: "Số dư ví sẽ được hoàn lại.",
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

// 6. Logic Filter (Demo cơ bản)
function applyFilter() {
    var walletId = $('#filterWallet').val();
    var type = $('#filterType').val();

    // DataTable Custom Search (Cột 3 là Ví, Cột 4 là Amount có chứa dấu +/- để biết Type)
    // Đây là demo, thực tế nên gọi API search server-side

    $.fn.dataTable.ext.search.push(
        function (settings, data, dataIndex) {
            var row = mockTransactions[dataIndex];

            // Filter Wallet
            if (walletId && row.walletId != walletId) return false;

            // Filter Type
            if (type && row.type !== type) return false;

            return true;
        }
    );
    table.draw();
    $.fn.dataTable.ext.search.pop(); // Reset search function
}

function resetFilter() {
    $('#filterWallet').val('');
    $('#filterType').val('');
    $('#filterFromDate').val('');
    $('#filterToDate').val('');
    table.search('').columns().search('').draw();
    applyFilter(); // Reset custom filter
}


$(async function () {
    try {
        const response = await fetch('/User/Transactions/GetAll');

        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }

        const data = await response.json();
        console.log(data);

        // xử lý data ở đây
        // render table, chart, v.v.
    } catch (err) {
        console.error(err);
    }
});