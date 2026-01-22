

var modalInstance;

$(document).ready(function () {
    console.log('Wallets.js loaded');
    
    $('#initialBalance').on('input', function (e) {
        var val = $(this).val();
        var numericValue = val.replace(/[^\d]/g, '');

        if (numericValue) {
            var formatted = parseInt(numericValue).toLocaleString('vi-VN');
            $(this).val(formatted);
        } else {
            $(this).val('');
        }

        $(this).data('numeric-value', numericValue ? parseInt(numericValue) : 0);
    });
});

// 1. MỞ MODAL
function openWalletModal(mode, id = null) {
    var myModalEl = document.getElementById('walletModal');
    modalInstance = new bootstrap.Modal(myModalEl);

    if (mode === 'add') {
        $('#modalTitle').text('Thêm Ví Mới');
        $('#walletForm')[0].reset();
        $('#walletID').val('0');
        $('#walletIcon').val('fa-wallet');
        $('#initialBalance').val('0').removeData('numeric-value');
        updateIconPreview();
        modalInstance.show();
    } else {
        $('#modalTitle').text('Cập Nhật Ví');

        // Fetch wallet data from server
        $.get('/User/Wallets/GetById/' + id, function (res) {
            if (res.success) {
                var wallet = res.data;
                $('#walletID').val(wallet.walletId);
                $('#walletName').val(wallet.walletName);
                $('#walletType').val(wallet.walletType);
                
                // Format and set initial balance
                var formattedAmount = parseInt(wallet.initialBalance).toLocaleString('vi-VN');
                $('#initialBalance').val(formattedAmount);
                $('#initialBalance').data('numeric-value', wallet.initialBalance);
                
                $('#walletIcon').val(wallet.icon);
                updateIconPreview();
                modalInstance.show();
            } else {
                Swal.fire('Lỗi', res.message || 'Không tìm thấy ví', 'error');
            }
        }).fail(function () {
            Swal.fire('Lỗi', 'Không thể tải dữ liệu ví', 'error');
        });
    }
}

// 2. LOGIC TỰ ĐỘNG CHỌN ICON THEO LOẠI
function autoSelectIcon() {
    var type = $('#walletType').val();
    var iconSelect = $('#walletIcon');

    if (type === 'Cash') iconSelect.val('fa-wallet');
    else if (type === 'Bank') iconSelect.val('fa-university');
    else if (type === 'E-Wallet') iconSelect.val('fa-mobile-alt');
    else if (type === 'Credit Card') iconSelect.val('fa-credit-card');
    else iconSelect.val('fa-wallet');

    updateIconPreview();
}

function updateIconPreview() {
    var iconClass = $('#walletIcon').val();
    $('#iconPreview').attr('class', 'fas ' + iconClass);
}

// 3. LƯU VÍ (CREATE/UPDATE)
$('#walletForm').on('submit', function (e) {
    e.preventDefault();

    var id = $('#walletID').val();
    var isNew = id == '0' || id == '';
    var url = isNew ? '/User/Wallets/Create' : '/User/Wallets/Update';

    var walletName = $('#walletName').val();
    var walletType = $('#walletType').val();
    
    // Get the numeric value stored during input formatting
    var initialBalance = $('#initialBalance').data('numeric-value');
    if (initialBalance === undefined || initialBalance === null) {
        initialBalance = 0;
    }
    
    var icon = $('#walletIcon').val();

    // Validate
    if (!walletName) {
        Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: 'Vui lòng nhập tên ví!'
        });
        return;
    }

    if (initialBalance < 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Số dư không hợp lệ',
            text: 'Số dư ban đầu không được âm!'
        });
        return;
    }

    var payload = {
        WalletId: isNew ? 0 : parseInt(id),
        WalletName: walletName,
        WalletType: walletType,
        InitialBalance: parseFloat(initialBalance),
        Icon: icon
    };

    console.log('Sending payload:', payload);

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: function (res) {
            console.log('Response:', res);
            if (res.success) {
                modalInstance.hide();
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: res.message || 'Đã lưu ví!',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    location.reload();
                });
            } else {
                Swal.fire('Lỗi', res.message || 'Có lỗi xảy ra', 'error');
            }
        },
        error: function (xhr, status, error) {
            console.error('AJAX Error:', xhr.responseText);
            var errorMsg = 'Không thể kết nối server';
            try {
                var response = JSON.parse(xhr.responseText);
                if (response.message) errorMsg = response.message;
            } catch (e) {
                errorMsg += ': ' + error;
            }
            Swal.fire('Lỗi', errorMsg, 'error');
        }
    });
});

// 4. XÓA VÍ
function deleteWallet(id) {
    Swal.fire({
        title: 'Xóa ví này?',
        text: "Lưu ý: Nếu có giao dịch thuộc ví này, sẽ không thể xóa!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            $.post('/User/Wallets/Delete/' + id, function (res) {
                if (res.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Đã xóa!',
                        text: res.message || 'Ví đã bị xóa.',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire('Lỗi', res.message || 'Không thể xóa ví', 'error');
                }
            }).fail(function () {
                Swal.fire('Lỗi', 'Không thể kết nối server', 'error');
            });
        }
    });
}

function debugDatabase() {
    $.get('/User/Wallets/Debug', function (res) {
        if (res.success) {
            var info = `
                <div class="text-start">
                    <h6>Database Info:</h6>
                    <ul>
                        <li>Total Users: <strong>${res.totalUsers}</strong></li>
                        <li>Total Wallets: <strong>${res.totalWallets}</strong></li>
                        <li>Total Transactions: <strong>${res.totalTransactions}</strong></li>
                    </ul>
                    <h6>Users:</h6>
                    <pre>${JSON.stringify(res.users, null, 2)}</pre>
                    <h6>Wallets:</h6>
                    <pre>${JSON.stringify(res.wallets, null, 2)}</pre>
                </div>
            `;

            Swal.fire({
                title: 'Debug Info',
                html: info,
                width: '800px',
                showCloseButton: true,
                showConfirmButton: false,
                footer: '<button class="btn btn-warning" onclick="seedData()">Tạo Dữ Liệu Mẫu</button>'
            });
        } else {
            Swal.fire('Lỗi', res.message, 'error');
        }
    }).fail(function () {
        Swal.fire('Lỗi', 'Không thể kết nối server', 'error');
    });
}

function seedData() {
    Swal.fire({
        title: 'Tạo dữ liệu mẫu?',
        text: "Sẽ tạo 3 ví mẫu cho user hiện tại",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Tạo',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            $.get('/User/Wallets/SeedData', function (res) {
                if (res.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công',
                        text: res.message,
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire('Thông báo', res.message, 'info');
                }
            }).fail(function () {
                Swal.fire('Lỗi', 'Không thể tạo dữ liệu mẫu', 'error');
            });
        }
    });
}