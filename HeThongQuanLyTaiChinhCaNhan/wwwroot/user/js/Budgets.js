// ==================== BUDGETS MANAGEMENT ====================

var modalInstance;

$(document).ready(function () {
    console.log('Budgets page loaded');
    
    // Format amount input with thousand separator
    $('#budgetAmount').on('input', function (e) {
        var val = $(this).val();
        var numericValue = val.replace(/[^\d]/g, '');

        if (numericValue) {
            var formatted = parseInt(numericValue).toLocaleString('vi-VN');
            $(this).val(formatted);
        } else {
            $(this).val('');
        }

        // Store raw numeric value for submission
        $(this).data('numeric-value', numericValue ? parseInt(numericValue) : 0);
    });
});

// --- MODAL HANDLERS ---

function openBudgetModal(mode, id = null) {
    var myModalEl = document.getElementById('budgetModal');
    modalInstance = new bootstrap.Modal(myModalEl);

    if (mode === 'add') {
        $('#modalTitle').html('<i class="fas fa-chart-line me-2"></i>Tạo Ngân Sách Mới');
        $('#budgetForm')[0].reset();
        $('#budgetID').val('0');
        $('#budgetAmount').removeData('numeric-value');
        setQuickDate('thisMonth'); // Default to current month
        modalInstance.show();
    } else {
        // Edit mode - Load data from server
        $('#modalTitle').html('<i class="fas fa-edit me-2"></i>Cập Nhật Ngân Sách #' + id);

        $.get('/User/Budgets/GetById/' + id, function (res) {
            if (res.success) {
                var item = res.data;
                $('#budgetID').val(item.budgetId);
                $('#budgetCategory').val(item.categoryId);
                
                // Format and set budget amount
                var formattedAmount = parseInt(item.budgetAmount).toLocaleString('vi-VN');
                $('#budgetAmount').val(formattedAmount);
                $('#budgetAmount').data('numeric-value', item.budgetAmount);
                
                $('#startDate').val(item.startDate);
                $('#endDate').val(item.endDate);

                modalInstance.show();
            } else {
                Swal.fire('Lỗi', res.message || 'Không tìm thấy dữ liệu', 'error');
            }
        }).fail(function () {
            Swal.fire('Lỗi', 'Không thể tải dữ liệu ngân sách', 'error');
        });
    }
}

// --- QUICK DATE HELPERS ---

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

// --- FORM SUBMIT ---

$('#budgetForm').on('submit', function (e) {
    e.preventDefault();

    var id = $('#budgetID').val();
    var isNew = id == '0' || id == '';
    var url = isNew ? '/User/Budgets/Create' : '/User/Budgets/Update';

    var categoryId = $('#budgetCategory').val();
    
    // Get the numeric value stored during input formatting
    var budgetAmount = $('#budgetAmount').data('numeric-value');
    if (budgetAmount === undefined || budgetAmount === null) {
        budgetAmount = 0;
    }
    
    var startDate = $('#startDate').val();
    var endDate = $('#endDate').val();

    // Validation
    if (!categoryId || !budgetAmount || !startDate || !endDate) {
        Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: 'Vui lòng điền đầy đủ thông tin bắt buộc!',
        });
        return;
    }

    if (budgetAmount <= 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Số tiền không hợp lệ',
            text: 'Hạn mức phải lớn hơn 0!',
        });
        return;
    }

    if (budgetAmount < 1000) {
        Swal.fire({
            icon: 'warning',
            title: 'Số tiền quá nhỏ',
            text: 'Hạn mức phải tối thiểu 1,000đ!',
        });
        return;
    }

    // Check date range
    if (new Date(endDate) < new Date(startDate)) {
        Swal.fire({
            icon: 'warning',
            title: 'Ngày không hợp lệ',
            text: 'Ngày kết thúc phải sau ngày bắt đầu!',
        });
        return;
    }

    var payload = {
        BudgetId: isNew ? 0 : parseInt(id),
        CategoryId: parseInt(categoryId),
        BudgetAmount: parseFloat(budgetAmount),
        StartDate: startDate,
        EndDate: endDate
    };

    Swal.fire({
        title: 'Đang xử lý...',
        text: 'Vui lòng đợi',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: function (res) {
            if (res.success) {
                modalInstance.hide();
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: res.message || 'Đã lưu ngân sách!',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    location.reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: res.message || 'Có lỗi xảy ra',
                    confirmButtonText: 'Đóng'
                });
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
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: errorMsg,
                confirmButtonText: 'Đóng'
            });
        }
    });
});

// --- DELETE BUDGET ---

function deleteBudget(id) {
    Swal.fire({
        title: 'Xóa ngân sách này?',
        text: "Bạn sẽ không còn theo dõi chi tiêu cho danh mục này nữa.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Đang xóa...',
                text: 'Vui lòng đợi',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            $.post('/User/Budgets/Delete/' + id, function (res) {
                if (res.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Đã xóa!',
                        text: res.message || 'Ngân sách đã bị xóa.',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: res.message || 'Không thể xóa ngân sách',
                        confirmButtonText: 'Đóng'
                    });
                }
            }).fail(function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể kết nối server',
                    confirmButtonText: 'Đóng'
                });
            });
        }
    });
}