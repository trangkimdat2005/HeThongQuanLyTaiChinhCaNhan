// 1. MOCK DATA
// Ví tiền (Để trừ tiền)
var mockWallets = [
    { id: 1, name: "Tiền mặt", balance: 4500000 },
    { id: 2, name: "Vietcombank", balance: 15000000 }
];

// Mục tiêu
var mockGoals = [
    {
        id: 1,
        name: "Mua Laptop mới",
        target: 25000000,
        current: 5000000,
        status: "Đang thực hiện"
    },
    {
        id: 2,
        name: "Du lịch hè",
        target: 10000000,
        current: 2000000,
        status: "Đang thực hiện"
    },
    {
        id: 3,
        name: "Mua sách",
        target: 500000,
        current: 500000,
        status: "Hoàn thành"
    }
];

var goalModal, depositModal;

$(document).ready(function () {
    renderGoals();
    renderOverallStats();
    loadWalletsToSelect();
});

// --- RENDER GIAO DIỆN ---

function renderGoals() {
    var html = '';

    mockGoals.forEach(g => {
        // Tính %
        var percent = Math.min(Math.round((g.current / g.target) * 100), 100);

        // Style cho mục tiêu hoàn thành
        var cardClass = g.status === 'Hoàn thành' ? 'goal-completed' : '';
        var progressColor = g.status === 'Hoàn thành' ? 'bg-success' : 'bg-primary';
        var icon = g.status === 'Hoàn thành' ? '<i class="fas fa-check-circle text-success fs-4"></i>' : '<div class="icon-circle bg-light text-primary"><i class="fas fa-bullseye"></i></div>';

        // Format tiền
        var currentFmt = g.current.toLocaleString('vi-VN');
        var targetFmt = g.target.toLocaleString('vi-VN');
        var remainFmt = (g.target - g.current).toLocaleString('vi-VN');

        html += `
        <div class="col-xl-4 col-md-6">
            <div class="card goal-card shadow-sm h-100 ${cardClass}">
                <div class="card-body d-flex flex-column">
                    
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="d-flex align-items-center">
                            <div class="me-3">${icon}</div>
                            <div>
                                <h6 class="fw-bold text-dark mb-0">${g.name}</h6>
                                <span class="badge bg-secondary bg-opacity-10 text-secondary border rounded-pill small">${g.status}</span>
                            </div>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-light btn-sm rounded-circle" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-h text-muted"></i></button>
                            <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                                <li><a class="dropdown-item" href="#" onclick="openGoalModal('edit', ${g.id})">Sửa mục tiêu</a></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="deleteGoal(${g.id})">Xóa</a></li>
                            </ul>
                        </div>
                    </div>

                    <div class="mb-2 d-flex justify-content-between fw-bold small">
                        <span class="text-muted">${currentFmt}đ</span>
                        <span class="${g.status === 'Hoàn thành' ? 'text-success' : 'text-primary'}">${percent}%</span>
                    </div>
                    <div class="progress mb-3" style="height: 10px;">
                        <div class="progress-bar ${progressColor} progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${percent}%"></div>
                    </div>

                    <div class="small text-muted mb-4 flex-grow-1">
                        Mục tiêu: <b>${targetFmt}đ</b>
                        ${g.status !== 'Hoàn thành' ? `<br>Còn thiếu: <span class="text-danger fw-bold">${remainFmt}đ</span>` : ''}
                    </div>

                    ${g.status !== 'Hoàn thành' ?
                `<button class="btn btn-deposit w-100 py-2 rounded-3" onclick="openDepositModal(${g.id})">
                            <i class="fas fa-plus-circle me-1"></i> Nạp tiền
                        </button>`
                :
                `<button class="btn btn-success w-100 py-2 rounded-3" disabled>
                            <i class="fas fa-check me-1"></i> Đã hoàn thành
                        </button>`
            }
                    
                </div>
            </div>
        </div>
        `;
    });

    // Nút Thêm mục tiêu dạng Card
    html += `
    <div class="col-xl-4 col-md-6">
        <div class="card h-100 border-2 border-dashed bg-light d-flex align-items-center justify-content-center" 
             style="border-style: dashed; cursor: pointer; min-height: 250px;" onclick="openGoalModal('add')">
            <div class="text-center text-muted">
                <i class="fas fa-plus fa-3x mb-2 text-primary opacity-50"></i>
                <h6 class="fw-bold">Mục Tiêu Mới</h6>
            </div>
        </div>
    </div>
    `;

    $('#goalList').html(html);
}

function renderOverallStats() {
    var totalSaved = mockGoals.reduce((a, b) => a + b.current, 0);
    var totalTarget = mockGoals.reduce((a, b) => a + b.target, 0);
    var totalPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

    $('#totalSavedDisplay').text(totalSaved.toLocaleString('vi-VN') + ' đ');
    $('#totalProgressDisplay').text(totalPercent + '%');

    // Vẽ chart nhỏ (Optional)
    // Code chart.js ở đây nếu muốn
}

// Load ví vào dropdown Modal Nạp tiền
function loadWalletsToSelect() {
    var opts = '';
    mockWallets.forEach(w => {
        opts += `<option value="${w.id}">${w.name} (Dư: ${w.balance.toLocaleString()}đ)</option>`;
    });
    $('#depositWallet').html(opts);
}


// --- XỬ LÝ MODAL MỤC TIÊU ---

function openGoalModal(mode, id = null) {
    var el = document.getElementById('goalModal');
    goalModal = new bootstrap.Modal(el);

    if (mode === 'add') {
        $('#goalModalTitle').text('Tạo Mục Tiêu Mới');
        $('#goalForm')[0].reset();
        $('#goalID').val('');
        $('#goalStatus').val('Đang thực hiện');
    } else {
        var g = mockGoals.find(x => x.id === id);
        if (g) {
            $('#goalModalTitle').text('Sửa Mục Tiêu');
            $('#goalID').val(g.id);
            $('#goalName').val(g.name);
            $('#targetAmount').val(g.target);
            $('#goalStatus').val(g.status);
        }
    }
    goalModal.show();
}

$('#goalForm').on('submit', function (e) {
    e.preventDefault();
    goalModal.hide();
    Swal.fire('Thành công', 'Thông tin mục tiêu đã được lưu', 'success').then(() => renderGoals());
});


// --- XỬ LÝ MODAL NẠP TIỀN (QUAN TRỌNG) ---

function openDepositModal(goalId) {
    var g = mockGoals.find(x => x.id === goalId);
    if (!g) return;

    var el = document.getElementById('depositModal');
    depositModal = new bootstrap.Modal(el);

    $('#depositGoalID').val(g.id);
    $('#depositGoalName').text(g.name);
    $('#depositAmount').val('');
    $('#depositNote').val('');

    depositModal.show();
}

$('#depositForm').on('submit', function (e) {
    e.preventDefault();

    var goalId = parseInt($('#depositGoalID').val());
    var walletId = parseInt($('#depositWallet').val());
    var amount = parseInt($('#depositAmount').val());

    // Logic giả lập:
    // 1. Tìm Goal -> Cộng CurrentAmount
    var goal = mockGoals.find(x => x.id === goalId);

    // 2. Tìm Wallet -> Trừ Balance
    var wallet = mockWallets.find(x => x.id === walletId);

    if (amount > wallet.balance) {
        Swal.fire('Lỗi', 'Số dư ví không đủ để nạp!', 'error');
        return;
    }

    depositModal.hide();

    // Giả lập xử lý thành công
    goal.current += amount;
    // Check nếu hoàn thành
    if (goal.current >= goal.target) {
        goal.status = 'Hoàn thành';
        Swal.fire('Chúc mừng!', `Bạn đã hoàn thành mục tiêu: ${goal.name}`, 'success');
    } else {
        Swal.fire('Thành công', `Đã nạp ${amount.toLocaleString()}đ vào mục tiêu.`, 'success');
    }

    // Render lại để thấy thay đổi
    renderGoals();
    renderOverallStats();
});

function deleteGoal(id) {
    Swal.fire({
        title: 'Xóa mục tiêu?',
        text: "Số tiền đã tiết kiệm sẽ được hoàn về Ví mặc định.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa'
    }).then((res) => {
        if (res.isConfirmed) Swal.fire('Đã xóa', '', 'success');
    });
}