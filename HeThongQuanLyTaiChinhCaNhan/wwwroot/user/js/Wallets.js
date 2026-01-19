// Dữ liệu giả (Mock Wallets)
var mockWallets = [
    { id: 1, name: "Tiền mặt", type: "Cash", balance: 4500000, initial: 500000, icon: "fa-wallet" },
    { id: 2, name: "Vietcombank", type: "Bank", balance: 15000000, initial: 2000000, icon: "fa-university" },
    { id: 3, name: "Momo", type: "E-Wallet", balance: 500000, initial: 0, icon: "fa-mobile-alt" },
    { id: 4, name: "VISA Credit", type: "Credit Card", balance: -2500000, initial: 0, icon: "fa-credit-card" }
];

var modalInstance;

$(document).ready(function () {
    renderWallets();
});

// 1. RENDER DANH SÁCH VÍ
function renderWallets() {
    var html = '';
    var totalBalance = 0;

    mockWallets.forEach(w => {
        totalBalance += w.balance;

        // Xác định màu sắc & class dựa trên loại ví
        var bgClass = 'bg-wallet-bank'; // Default
        var iconBg = '#4e73df';

        if (w.type === 'Cash') { bgClass = 'bg-wallet-cash'; iconBg = '#1cc88a'; }
        else if (w.type === 'E-Wallet') { bgClass = 'bg-wallet-ewallet'; iconBg = '#e74a3b'; }
        else if (w.type === 'Credit Card') { bgClass = 'bg-wallet-credit'; iconBg = '#f6c23e'; }

        // Format tiền tệ
        var balanceFormatted = w.balance.toLocaleString('vi-VN') + ' đ';
        var balanceColor = w.balance >= 0 ? 'text-dark' : 'text-danger';

        html += `
        <div class="col-xl-3 col-md-6">
            <div class="card shadow-sm wallet-card h-100 ${bgClass}">
                <div class="card-body">
                    <div class="dropdown wallet-actions">
                        <a href="#" class="text-muted" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></a>
                        <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                            <li><a class="dropdown-item" href="#" onclick="openWalletModal('edit', ${w.id})"><i class="fas fa-edit me-2 text-primary"></i>Sửa</a></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="deleteWallet(${w.id})"><i class="fas fa-trash-alt me-2"></i>Xóa</a></li>
                        </ul>
                    </div>

                    <div class="wallet-icon-circle shadow-sm" style="background-color: ${iconBg};">
                        <i class="fas ${w.icon}"></i>
                    </div>
                    <h5 class="fw-bold text-dark mb-1">${w.name}</h5>
                    <span class="badge bg-white border text-muted mb-3">${w.type}</span>
                    
                    <div class="mt-2">
                        <small class="text-muted text-uppercase fw-bold" style="font-size: 0.7rem;">Số dư hiện tại</small>
                        <h4 class="fw-bold mb-0 ${balanceColor}">${balanceFormatted}</h4>
                    </div>
                </div>
            </div>
        </div>
        `;
    });

    // Thêm nút "Thêm ví mới" dạng Card (Optional)
    html += `
    <div class="col-xl-3 col-md-6">
        <div class="card shadow-sm h-100 border-2 border-dashed bg-light d-flex align-items-center justify-content-center" 
             style="border-style: dashed; cursor: pointer; min-height: 220px;" onclick="openWalletModal('add')">
            <div class="text-center text-muted">
                <i class="fas fa-plus-circle fa-3x mb-2 text-primary opacity-50"></i>
                <h6 class="fw-bold">Thêm Ví Mới</h6>
            </div>
        </div>
    </div>
    `;

    $('#walletList').html(html);
    $('#totalBalanceDisplay').text(totalBalance.toLocaleString('vi-VN') + ' đ');
}

// 2. MỞ MODAL
function openWalletModal(mode, id = null) {
    var myModalEl = document.getElementById('walletModal');
    modalInstance = new bootstrap.Modal(myModalEl);

    if (mode === 'add') {
        $('#modalTitle').text('Thêm Ví Mới');
        $('#walletForm')[0].reset();
        $('#walletID').val('');
        $('#walletIcon').val('fa-wallet'); // Default
        updateIconPreview();
    } else {
        var wallet = mockWallets.find(w => w.id === id);
        if (wallet) {
            $('#modalTitle').text('Cập Nhật Ví');
            $('#walletID').val(wallet.id);
            $('#walletName').val(wallet.name);
            $('#walletType').val(wallet.type);
            $('#initialBalance').val(wallet.initial);
            $('#walletIcon').val(wallet.icon);
            updateIconPreview();
        }
    }
    modalInstance.show();
}

// 3. LOGIC TỰ ĐỘNG CHỌN ICON THEO LOẠI
function autoSelectIcon() {
    var type = $('#walletType').val();
    var iconSelect = $('#walletIcon');

    if (type === 'Cash') iconSelect.val('fa-wallet');
    else if (type === 'Bank') iconSelect.val('fa-university');
    else if (type === 'E-Wallet') iconSelect.val('fa-mobile-alt');
    else if (type === 'Credit Card') iconSelect.val('fa-credit-card');

    updateIconPreview(); // Cập nhật hình ảnh icon bên cạnh
}

function updateIconPreview() {
    var iconClass = $('#walletIcon').val();
    $('#iconPreview').attr('class', 'fas ' + iconClass);
}

// 4. LƯU VÍ
$('#walletForm').on('submit', function (e) {
    e.preventDefault();
    modalInstance.hide();

    Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Thông tin ví đã được lưu!',
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        // Trong thực tế: Reload lại data từ server
        // Ở đây mình reload trang demo
        location.reload();
    });
});

// 5. XÓA VÍ
function deleteWallet(id) {
    Swal.fire({
        title: 'Xóa ví này?',
        text: "Cảnh báo: Tất cả giao dịch thuộc ví này cũng sẽ bị ẩn!",
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