// ==================== GOALS MANAGEMENT ====================

var goalModal, depositModal;
var allGoals = [];
var allWallets = [];
var hasWallets = false;

$(document).ready(function () {
    console.log('Goals.js loaded successfully');

    if (typeof serverWallets !== 'undefined') {
        allWallets = serverWallets;
        hasWallets = allWallets && allWallets.length > 0;
        console.log('Loaded wallets from server:', allWallets);
    } else {
        console.warn('serverWallets not defined, loading from API');
        loadWallets();
    }

    loadGoals();
});

// --- LOAD DATA FROM SERVER ---

function loadGoals() {
    console.log('Loading goals...');
    $.get('/User/Goals/GetAll', function (res) {
        console.log('Goals response:', res);
        if (res.success) {
            allGoals = res.data;
            renderGoals();
            renderOverallStats();
        } else {
            Swal.fire('Lỗi', res.message || 'Không thể tải mục tiêu', 'error');
        }
    }).fail(function (xhr, status, error) {
        console.error('Failed to load goals:', { xhr, status, error });
        Swal.fire('Lỗi', 'Không thể kết nối đến server. Vui lòng thử lại.', 'error');
    });
}

function loadWallets() {
    // Use serverWallets from View if available
    if (typeof serverWallets !== 'undefined' && serverWallets.length > 0) {
        allWallets = serverWallets;
        hasWallets = true;
        console.log('Using wallets from server:', allWallets);
        renderWalletsToSelect();
        return;
    }

    // Fallback: Load from API
    $.get('/User/Wallets/GetAll', function (res) {
        if (res.success) {
            allWallets = res.data;
            hasWallets = allWallets && allWallets.length > 0;
            renderWalletsToSelect();
        }
    }).fail(function () {
        console.log('No wallets loaded - using ViewBag data');
        hasWallets = false;
    });
}

function renderWalletsToSelect() {
    if (!allWallets || allWallets.length === 0) return;

    var opts = '';
    allWallets.forEach(w => {
        var balance = w.balance || 0;
        opts += `<option value="${w.walletId}">${w.walletName} (Dư: ${balance.toLocaleString()}đ)</option>`;
    });
    $('#depositWallet').html(opts);
}

// --- RENDER UI ---

function renderGoals() {
    var html = '';

    allGoals.forEach(g => {
        var percent = Math.min(Math.round((g.current / g.target) * 100), 100);
        var cardClass = g.status === 'Hoàn thành' ? 'goal-completed' : '';
        var progressColor = g.status === 'Hoàn thành' ? 'bg-success' : 'bg-primary';
        var icon = g.status === 'Hoàn thành'
            ? '<i class="fas fa-check-circle text-success fs-4"></i>'
            : '<div class="icon-circle bg-light text-primary"><i class="fas fa-bullseye"></i></div>';

        var currentFmt = (g.current || 0).toLocaleString('vi-VN');
        var targetFmt = g.target.toLocaleString('vi-VN');
        var remainFmt = (g.target - (g.current || 0)).toLocaleString('vi-VN');

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
                            <button class="btn btn-light btn-sm rounded-circle" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-h text-muted"></i>
                            </button>
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
                        <div class="progress-bar ${progressColor} progress-bar-striped progress-bar-animated" 
                             role="progressbar" style="width: ${percent}%"></div>
                    </div>

                    <div class="small text-muted mb-4 flex-grow-1">
                        Mục tiêu: <b>${targetFmt}đ</b>
                        ${g.status !== 'Hoàn thành' ? `<br>Còn thiếu: <span class="text-danger fw-bold">${remainFmt}đ</span>` : ''}
                    </div>

                    ${g.status === 'Hoàn thành' ?
                `<button class="btn btn-success w-100 py-2 rounded-3" disabled>
                            <i class="fas fa-check me-1"></i> Đã hoàn thành
                        </button>`
                :
                g.status === 'Tạm dừng' ?
                    `<button class="btn btn-secondary w-100 py-2 rounded-3" disabled>
                            <i class="fas fa-pause-circle me-1"></i> Tạm dừng
                        </button>`
                    :
                    `<button class="btn btn-deposit w-100 py-2 rounded-3" onclick="openDepositModal(${g.id})">
                            <i class="fas fa-plus-circle me-1"></i> Nạp tiền
                        </button>`
            }
                </div>
            </div>
        </div>
        `;
    });

    // Add new goal card
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
    if (allGoals.length === 0) {
        $('#totalSavedDisplay').text('0 đ');
        $('#totalProgressDisplay').text('0%');
        return;
    }

    var totalSaved = allGoals.reduce((a, b) => a + (b.current || 0), 0);
    var totalTarget = allGoals.reduce((a, b) => a + b.target, 0);
    var totalPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

    $('#totalSavedDisplay').text(totalSaved.toLocaleString('vi-VN') + ' đ');
    $('#totalProgressDisplay').text(totalPercent + '%');
}

// --- GOAL MODAL HANDLERS ---

function openGoalModal(mode, id = null) {
    var el = document.getElementById('goalModal');
    goalModal = new bootstrap.Modal(el);

    if (mode === 'add') {
        $('#goalModalTitle').text('Tạo Mục Tiêu Mới');
        $('#goalForm')[0].reset();
        $('#goalID').val('0');
        $('#goalStatus').val('Đang thực hiện');

        $('#targetAmountHint').remove();
        $('#statusHint').remove();
        $('#statusLockHint').remove();
        $('#targetAmount').attr('min', 1);
        $('#goalStatus').prop('disabled', false);
        $('#targetAmount').off('input');
        
        // Add number formatting for target amount
        $('#targetAmount').on('input', function(e) {
            var val = $(this).val();
            // Remove all non-digit characters
            var numericValue = val.replace(/[^\d]/g, '');
            
            // Format with thousand separator
            if (numericValue) {
                var formatted = parseInt(numericValue).toLocaleString('vi-VN');
                $(this).val(formatted);
            } else {
                $(this).val('');
            }
            
            // Store numeric value in data attribute
            $(this).data('numeric-value', numericValue ? parseInt(numericValue) : 0);
        });

        goalModal.show();
    } else {
        $('#goalModalTitle').text('Sửa Mục Tiêu #' + id);
        $.get('/User/Goals/GetById/' + id, function (res) {
            if (res.success) {
                var g = res.data;
                $('#goalID').val(g.goalId);
                $('#goalName').val(g.goalName);
                
                // Format and display target amount with thousand separator
                var formattedTarget = g.targetAmount.toLocaleString('vi-VN');
                $('#targetAmount').val(formattedTarget);
                $('#targetAmount').data('numeric-value', g.targetAmount);
                
                $('#goalStatus').val(g.status);

                $('#targetAmount').data('original-value', g.targetAmount);
                $('#targetAmount').data('current-amount', g.currentAmount || 0);

                var currentAmount = g.currentAmount || 0;
                $('#targetAmount').attr('min', currentAmount);

                var existingHint = $('#targetAmountHint');
                if (existingHint.length === 0) {
                    $('#targetAmount').parent().after(`
                        <div id="targetAmountHint" class="form-text small text-warning mt-1">
                            <i class="fas fa-exclamation-triangle me-1"></i>
                            Đã nạp <strong>${currentAmount.toLocaleString()}đ</strong>. 
                            Số tiền mục tiêu phải lớn hơn hoặc bằng số tiền này.
                        </div>
                    `);
                } else {
                    existingHint.html(`
                        <i class="fas fa-exclamation-triangle me-1"></i>
                        Đã nạp <strong>${currentAmount.toLocaleString()}đ</strong>. 
                        Số tiền mục tiêu phải lớn hơn hoặc bằng số tiền này.
                    `);
                }

                var statusSelect = $('#goalStatus');
                statusSelect.find('option').prop('disabled', false);
                $('#statusHint').remove();
                $('#statusLockHint').remove();
                $('#targetAmount').off('input');

                // Nếu chưa đủ tiền → Disable "Hoàn thành"
                if (currentAmount < g.targetAmount) {
                    statusSelect.find('option[value="Hoàn thành"]').prop('disabled', true);

                    if (g.status === 'Hoàn thành') {
                        statusSelect.val('Đang thực hiện');
                    }

                    statusSelect.after(`
                        <div id="statusHint" class="form-text small text-info mt-1">
                            <i class="fas fa-info-circle me-1"></i>
                            Cần đạt <strong>${(g.targetAmount - currentAmount).toLocaleString()}đ</strong> nữa để hoàn thành mục tiêu.
                        </div>
                    `);
                }

                if (currentAmount >= g.targetAmount && g.status === 'Hoàn thành') {
                    // Trường hợp: Mục tiêu đã hoàn thành
                    statusSelect.find('option').not('[value="Hoàn thành"]').prop('disabled', true);
                    statusSelect.val('Hoàn thành');

                    statusSelect.after(`
                        <div id="statusLockHint" class="form-text small text-success mt-1">
                            <i class="fas fa-lock me-1"></i>
                            Trạng thái bị khóa. Tăng số tiền mục tiêu để có thể thay đổi.
                        </div>
                    `);

                    $('#targetAmount').on('input', function () {
                        var val = $(this).val();
                        var numericValue = val.replace(/[^\d]/g, '');
                        
                        if (numericValue) {
                            var formatted = parseInt(numericValue).toLocaleString('vi-VN');
                            $(this).val(formatted);
                        } else {
                            $(this).val('');
                        }
                        
                        var newTarget = numericValue ? parseInt(numericValue) : 0;
                        $(this).data('numeric-value', newTarget);
                        
                        var currentAmt = parseFloat($(this).data('current-amount')) || 0;

                        console.log('Target changed (completed status):', { newTarget, currentAmt });

                        if (newTarget > currentAmt) {
                            statusSelect.find('option').prop('disabled', false);
                            statusSelect.find('option[value="Hoàn thành"]').prop('disabled', true);

                            statusSelect.val('Đang thực hiện').trigger('change');

                            statusSelect.addClass('status-auto-changed');
                            setTimeout(function () {
                                statusSelect.removeClass('status-auto-changed');
                            }, 1500);

                            $('#statusLockHint').html(`
                                <i class="fas fa-unlock me-1"></i>
                                Đã tăng mục tiêu. Trạng thái tự động chuyển sang <strong>"Đang thực hiện"</strong>. Bạn có thể chọn <strong>"Tạm dừng"</strong> nếu muốn.
                            `).removeClass('text-success').addClass('text-warning');

                            console.log('Status force changed to: Đang thực hiện');
                        } 
                        // Nếu giảm target xuống <= current → Vẫn giữ "Hoàn thành" và lock
                        else if (newTarget <= currentAmt && newTarget > 0) {
                            statusSelect.find('option').not('[value="Hoàn thành"]').prop('disabled', true);
                            statusSelect.val('Hoàn thành').trigger('change');

                            statusSelect.removeClass('status-auto-changed');

                            $('#statusLockHint').html(`
                                <i class="fas fa-lock me-1"></i>
                                Trạng thái bị khóa. Tăng số tiền mục tiêu để có thể thay đổi.
                            `).removeClass('text-warning').addClass('text-success');
                        }
                    });
                }
                
                // Trường hợp: Mục tiêu CHƯA hoàn thành (Đang thực hiện / Tạm dừng)
                if (currentAmount < g.targetAmount || g.status !== 'Hoàn thành') {
                    $('#targetAmount').on('input', function () {
                        var val = $(this).val();
                        var numericValue = val.replace(/[^\d]/g, '');
                        
                        if (numericValue) {
                            var formatted = parseInt(numericValue).toLocaleString('vi-VN');
                            $(this).val(formatted);
                        } else {
                            $(this).val('');
                        }
                        
                        var newTarget = numericValue ? parseInt(numericValue) : 0;
                        $(this).data('numeric-value', newTarget);
                        
                        var currentAmt = parseFloat($(this).data('current-amount')) || 0;

                        console.log('Target input (not completed case):', { newTarget, currentAmt });

                        if (newTarget > 0 && newTarget <= currentAmt) {
                            statusSelect.find('option').prop('disabled', true);
                            statusSelect.find('option[value="Hoàn thành"]').prop('disabled', false);

                            statusSelect.val('Hoàn thành').trigger('change');

                            statusSelect.addClass('status-auto-changed');
                            setTimeout(function () {
                                statusSelect.removeClass('status-auto-changed');
                            }, 1500);

                            $('#statusHint').remove();
                            if ($('#statusLockHint').length === 0) {
                                statusSelect.after(`
                                    <div id="statusLockHint" class="form-text small text-success mt-1">
                                        <i class="fas fa-check-circle me-1"></i>
                                        Đã đạt mục tiêu! Trạng thái tự động chuyển sang <strong>"Hoàn thành"</strong> và bị khóa. Tăng mục tiêu để thay đổi.
                                    </div>
                                `);
                            } else {
                                $('#statusLockHint').html(`
                                    <i class="fas fa-check-circle me-1"></i>
                                    Đã đạt mục tiêu! Trạng thái tự động chuyển sang <strong>"Hoàn thành"</strong> và bị khóa. Tăng mục tiêu để thay đổi.
                                `).removeClass('text-warning text-info').addClass('text-success');
                            }

                            console.log('Auto-changed to Hoàn thành and LOCKED because target <= current');
                        }
                       
                        else if (newTarget > currentAmt) {
                            statusSelect.find('option').prop('disabled', false);
                            statusSelect.find('option[value="Hoàn thành"]').prop('disabled', true);

                            var currentStatus = statusSelect.val();
                            if (currentStatus === 'Hoàn thành') {
                                // Chỉ force khi đang là "Hoàn thành"
                                statusSelect.val('Đang thực hiện').trigger('change');

                                statusSelect.addClass('status-auto-changed');
                                setTimeout(function () {
                                    statusSelect.removeClass('status-auto-changed');
                                }, 1500);
                            }

                            $('#statusLockHint').remove();
                            if ($('#statusHint').length === 0) {
                                statusSelect.after(`
                                    <div id="statusHint" class="form-text small text-info mt-1">
                                        <i class="fas fa-info-circle me-1"></i>
                                        Cần đạt <strong>${(newTarget - currentAmt).toLocaleString()}đ</strong> nữa để hoàn thành mục tiêu.
                                    </div>
                                `);
                            } else {
                                $('#statusHint').html(`
                                    <i class="fas fa-info-circle me-1"></i>
                                    Cần đạt <strong>${(newTarget - currentAmt).toLocaleString()}đ</strong> nữa để hoàn thành mục tiêu.
                                `);
                            }

                            console.log('Target > current, disabled Hoàn thành, keeping current status:', currentStatus);
                        }
                    });
                }

                goalModal.show();
            } else {
                Swal.fire('Lỗi', res.message || 'Không tìm thấy dữ liệu', 'error');
            }
        }).fail(function () {
            Swal.fire('Lỗi', 'Không thể tải dữ liệu mục tiêu', 'error');
        });
    }
}

$('#goalForm').on('submit', function (e) {
    e.preventDefault();

    var id = $('#goalID').val();
    var isNew = id == '0' || id == '';
    var url = isNew ? '/User/Goals/Create' : '/User/Goals/Update';

    var goalName = $('#goalName').val();
    // Get numeric value from data attribute (without thousand separator)
    var targetAmount = $('#targetAmount').data('numeric-value') || parseFloat($('#targetAmount').val().replace(/\./g, '').replace(/,/g, ''));
    var goalStatus = $('#goalStatus').val();

    // Validation
    if (!goalName || !targetAmount) {
        Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: 'Vui lòng điền đầy đủ thông tin bắt buộc!',
        });
        return;
    }

    if (targetAmount <= 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Số tiền không hợp lệ',
            text: 'Số tiền mục tiêu phải lớn hơn 0!',
        });
        return;
    }

    if (!isNew) {
        var minAmount = parseFloat($('#targetAmount').attr('min'));
        if (targetAmount < minAmount) {
            Swal.fire({
                icon: 'warning',
                title: 'Số tiền không hợp lệ',
                html: `Số tiền mục tiêu phải lớn hơn hoặc bằng <strong>${minAmount.toLocaleString()}đ</strong> (số tiền đã nạp).`,
            });
            return;
        }
    }

    var payload = {
        GoalId: isNew ? 0 : parseInt(id),
        GoalName: goalName,
        TargetAmount: targetAmount,
        Status: goalStatus
    };

    console.log('Sending payload:', payload);

    $.post({
        url: url,
        data: JSON.stringify(payload),
        contentType: 'application/json',
        success: function (res) {
            console.log('Response:', res);
            if (res.success) {
                goalModal.hide();

                var message = res.message || 'Đã lưu mục tiêu!';
                if (res.newStatus) {
                    message += `\nTrạng thái: ${res.newStatus}`;
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: message,
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    loadGoals();
                });
            } else {
                Swal.fire('Lỗi', res.message || 'Có lỗi xảy ra', 'error');
            }
        },
        error: function (xhr) {
            console.error('Error:', xhr.responseText);
            var errorMsg = 'Không thể kết nối server';
            try {
                var response = JSON.parse(xhr.responseText);
                if (response.message) errorMsg = response.message;
            } catch (e) {
                errorMsg += ': ' + xhr.statusText;
            }
            Swal.fire('Lỗi', errorMsg, 'error');
        }
    });
});

function deleteGoal(id) {
    Swal.fire({
        title: 'Xóa mục tiêu này?',
        text: "Bạn sẽ không thể khôi phục lại!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            $.post('/User/Goals/Delete/' + id, function (res) {
                if (res.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Đã xóa!',
                        text: res.message || 'Mục tiêu đã bị xóa.',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        loadGoals();
                    });
                } else {
                    Swal.fire('Lỗi', res.message || 'Không thể xóa mục tiêu', 'error');
                }
            }).fail(function () {
                Swal.fire('Lỗi', 'Không thể kết nối server', 'error');
            });
        }
    });
}

// --- DEPOSIT MODAL HANDLERS ---

function openDepositModal(goalId) {
    var g = allGoals.find(x => x.id === goalId);
    if (!g) {
        Swal.fire('Lỗi', 'Không tìm thấy mục tiêu', 'error');
        return;
    }

    if (g.status === 'Tạm dừng') {
        Swal.fire({
            icon: 'warning',
            title: 'Mục tiêu đang tạm dừng',
            html: `Mục tiêu <strong>"${g.name}"</strong> đang ở trạng thái <strong>Tạm dừng</strong>.<br><br>Vui lòng chuyển sang trạng thái <strong>"Đang thực hiện"</strong> trước khi nạp tiền.`,
            confirmButtonText: 'Sửa trạng thái',
            showCancelButton: true,
            cancelButtonText: 'Đóng',
            confirmButtonColor: '#3085d6'
        }).then((result) => {
            if (result.isConfirmed) {
                openGoalModal('edit', goalId);
            }
        });
        return;
    }

    if (g.status === 'Hoàn thành' || g.target <= (g.current || 0)) {
        Swal.fire({
            icon: 'info',
            title: 'Mục tiêu đã hoàn thành',
            html: `Mục tiêu <strong>"${g.name}"</strong> đã đạt hoặc vượt quá số tiền mục tiêu.<br><br>Bạn có muốn điều chỉnh số tiền mục tiêu hoặc trạng thái không?`,
            showCancelButton: true,
            confirmButtonText: 'Sửa mục tiêu',
            cancelButtonText: 'Đóng',
            confirmButtonColor: '#3085d6'
        }).then((result) => {
            if (result.isConfirmed) {
                openGoalModal('edit', goalId);
            }
        });
        return;
    }

    if (!hasWallets && allWallets.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Chưa có ví',
            text: 'Vui lòng tạo ví trước khi nạp tiền vào mục tiêu.',
            confirmButtonText: 'Đến trang Ví',
            showCancelButton: true,
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/User/Wallets';
            }
        });
        return;
    }

    var el = document.getElementById('depositModal');
    depositModal = new bootstrap.Modal(el);

    $('#depositGoalID').val(g.id);
    $('#depositGoalName').text(g.name);
    $('#depositAmount').val('');
    $('#depositNote').val('');
    $('#depositStatus').val('Đang thực hiện');

    // TÍNH SỐ TIỀN CÒN THIẾU VÀ SET MAX CHO INPUT
    var remaining = g.target - (g.current || 0);
    $('#depositAmount').data('max-value', remaining);

    var existingHint = $('#depositAmountHint');
    if (existingHint.length === 0) {
        $('#depositAmount').parent().after(`
            <div id="depositAmountHint" class="form-text small text-info mt-1">
                <i class="fas fa-info-circle me-1"></i>
                Còn thiếu <strong>${remaining.toLocaleString()}đ</strong> để hoàn thành mục tiêu. Tối đa: <strong>${remaining.toLocaleString()}đ</strong>
            </div>
        `);
    } else {
        existingHint.html(`
            <i class="fas fa-info-circle me-1"></i>
            Còn thiếu <strong>${remaining.toLocaleString()}đ</strong> để hoàn thành mục tiêu. Tối đa: <strong>${remaining.toLocaleString()}đ</strong>
        `);
    }

    $('#depositAmount').off('input').on('input', function(e) {
        var val = $(this).val();
        // Xóa tất cả ký tự không phải số
        var numericValue = val.replace(/[^\d]/g, '');
        
        // Format với dấu chấm phân cách ngàn
        if (numericValue) {
            var formatted = parseInt(numericValue).toLocaleString('vi-VN');
            $(this).val(formatted);
        } else {
            $(this).val('');
        }
        
        // Lưu giá trị số thực vào data attribute
        $(this).data('numeric-value', numericValue ? parseInt(numericValue) : 0);
    });

    depositModal.show();
}

$('#depositForm').on('submit', function (e) {
    e.preventDefault();

    var goalId = parseInt($('#depositGoalID').val());
    var walletId = parseInt($('#depositWallet').val());

    var amount = $('#depositAmount').data('numeric-value') || 0;
    var note = $('#depositNote').val();
    var status = $('#depositStatus').val();

    // Validation
    if (!amount || amount <= 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Số tiền không hợp lệ',
            text: 'Vui lòng nhập số tiền lớn hơn 0!',
        });
        return;
    }

    if (!walletId || walletId <= 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Chưa chọn ví',
            text: 'Vui lòng chọn ví để nạp tiền!',
        });
        return;
    }

    if (!status) {
        Swal.fire({
            icon: 'warning',
            title: 'Chưa chọn trạng thái',
            text: 'Vui lòng chọn trạng thái sau khi nạp tiền!',
        });
        return;
    }

    var goal = allGoals.find(x => x.id === goalId);
    if (goal) {
        var remaining = goal.target - (goal.current || 0);
        if (amount > remaining) {
            Swal.fire({
                icon: 'warning',
                title: 'Số tiền vượt quá',
                html: `Bạn chỉ cần nạp tối đa <strong>${remaining.toLocaleString()}đ</strong> để hoàn thành mục tiêu.<br><br>Bạn có muốn nạp đúng số tiền còn thiếu không?`,
                showCancelButton: true,
                confirmButtonText: `Nạp ${remaining.toLocaleString()}đ`,
                cancelButtonText: 'Hủy',
                confirmButtonColor: '#28a745'
            }).then((result) => {
                if (result.isConfirmed) {

                    submitDeposit(goalId, walletId, remaining, note, status);
                }
            });
            return;
        }
    }

    submitDeposit(goalId, walletId, amount, note, status);
});

function submitDeposit(goalId, walletId, amount, note, status) {
    var payload = {
        GoalId: goalId,
        WalletId: walletId,
        Amount: amount,
        Note: note,
        Status: status || 'Đang thực hiện'
    };

    console.log('Deposit payload:', payload);

    depositModal.hide();

    $.post({
        url: '/User/Goals/Deposit',
        data: JSON.stringify(payload),
        contentType: 'application/json',
        success: function (res) {
            console.log('Deposit response:', res);
            if (res.success) {
                var icon = res.isCompleted ? 'success' : 'success';
                var title = res.isCompleted ? 'Chúc mừng!' : 'Thành công';

                Swal.fire({
                    icon: icon,
                    title: title,
                    text: res.message,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    loadGoals();
                    setTimeout(() => {
                        location.reload();
                    }, 500);
                });
            } else {
                Swal.fire('Lỗi', res.message || 'Không thể nạp tiền', 'error');
            }
        },
        error: function (xhr) {
            console.error('Error:', xhr.responseText);
            var errorMsg = 'Không thể kết nối server';
            try {
                var response = JSON.parse(xhr.responseText);
                if (response.message) errorMsg = response.message;
            } catch (e) {
                errorMsg += ': ' + xhr.statusText;
            }
            Swal.fire('Lỗi', errorMsg, 'error');
        }
    });
}