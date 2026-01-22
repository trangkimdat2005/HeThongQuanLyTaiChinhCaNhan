// ==================== TRANSACTIONS MANAGEMENT ====================
var table;
var modalInstance;

$(document).ready(function () {
    // 1. Init DataTable
    table = $('#tableTransaction').DataTable({
        language: {
            search: "Tìm nhanh:",
            lengthMenu: "Hiển thị _MENU_ dòng",
            info: "_START_ - _END_ / _TOTAL_",
            infoEmpty: "Không có dữ liệu",
            zeroRecords: "Không tìm thấy kết quả nào khớp",
            paginate: { first: "«", last: "»", next: "›", previous: "‹" }
        },
        pageLength: 10,
        lengthMenu: [5, 10, 20, 50],
        ordering: true,
        responsive: true,
        columnDefs: [
            { orderable: false, targets: -1 }
        ]
    });

    document.getElementById('transDate').valueAsDate = new Date();

    document.getElementById('typeExpense').addEventListener('change', function () {
        loadCategoriesByType('Expense');
    });
    document.getElementById('typeIncome').addEventListener('change', function () {
        loadCategoriesByType('Income');
    });

    loadCategoriesByType('Expense');

    $('#transAmount').on('input', function (e) {
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

function loadCategoriesByType(type) {
    if (typeof allCategories === 'undefined' || allCategories.length === 0) {
        $.get('/User/Transactions/GetCategoriesByType?type=' + type, function (data) {
            var opts = '';
            if (data && data.length > 0) {
                data.forEach(function (c) {
                    opts += `<option value="${c.categoryId}">${c.categoryName}</option>`;
                });
            }
            $('#transCategory').html(opts);
        }).fail(function () {
            console.error('Failed to load categories');
            $('#transCategory').html('<option value="">Không thể tải danh mục</option>');
        });
    } else {
        var filtered = allCategories.filter(function (c) {
            return (c.Type || c.type) === type;
        });
        var opts = '';
        if (filtered.length > 0) {
            filtered.forEach(function (c) {
                var id = c.CategoryId || c.categoryId;
                var name = c.CategoryName || c.categoryName;
                opts += `<option value="${id}">${name}</option>`;
            });
        } else {
            opts = '<option value="">Không có danh mục nào</option>';
        }
        $('#transCategory').html(opts);
    }
}

function openTransactionModal(mode, id = null) {
    var myModalEl = document.getElementById('transactionModal');
    modalInstance = new bootstrap.Modal(myModalEl);
    $('#transactionForm')[0].reset();
    $('#transAmount').removeData('numeric-value');

    if (mode === 'add') {
        $('#modalTitle').text('Thêm Giao Dịch');
        $('#transID').val('0');
        document.getElementById('transDate').valueAsDate = new Date();
        $('#typeExpense').prop('checked', true).trigger('change');
        modalInstance.show();
    } else {
        $('#modalTitle').text('Sửa Giao Dịch #' + id);
        $.get('/User/Transactions/GetById/' + id, function (res) {
            if (res.success) {
                var item = res.data;
                $('#transID').val(item.transactionId);
                var formattedAmount = parseInt(item.amount).toLocaleString('vi-VN');
                $('#transAmount').val(formattedAmount);
                $('#transAmount').data('numeric-value', item.amount);
                $('#transDesc').val(item.description || '');
                $('#transDate').val(item.transactionDate);
                $('#transWallet').val(item.walletId);

                if (item.type === 'Income') {
                    $('#typeIncome').prop('checked', true).trigger('change');
                } else {
                    $('#typeExpense').prop('checked', true).trigger('change');
                }

                setTimeout(function () {
                    $('#transCategory').val(item.categoryId);
                }, 100);

                modalInstance.show();
            } else {
                Swal.fire('Lỗi', res.message || 'Không tìm thấy dữ liệu', 'error');
            }
        }).fail(function () {
            Swal.fire('Lỗi', 'Không thể tải dữ liệu giao dịch', 'error');
        });
    }
}

$('#transactionForm').on('submit', function (e) {
    e.preventDefault();

    var id = $('#transID').val();
    var isNew = id == '0' || id == '';
    var url = isNew ? '/User/Transactions/Create' : '/User/Transactions/Update';

    var amountNumeric = $('#transAmount').data('numeric-value');
    var categoryId = $('#transCategory').val();
    var walletId = $('#transWallet').val();
    var transDate = $('#transDate').val();
    var type = document.querySelector('input[name="transType"]:checked')?.value;

    if (!amountNumeric || !categoryId || !walletId || !transDate || !type) {
        Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: 'Vui lòng điền đầy đủ thông tin bắt buộc!',
        });
        return;
    }

    if (amountNumeric <= 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Số tiền không hợp lệ',
            text: 'Số tiền phải lớn hơn 0!',
        });
        return;
    }

    //  KIỂM TRA SỐ DƯ VÍ CHO GIAO DỊCH CHI 
    if (type === 'Expense') {
        $.get('/User/Transactions/GetWalletBalance/' + walletId, function (walletRes) {
            if (walletRes.success) {
                var currentBalance = walletRes.balance;

                // Nếu đang sửa, cần hoàn trả số dư cũ trước khi kiểm tra
                if (!isNew) {
                    $.get('/User/Transactions/GetById/' + id, function (transRes) {
                        if (transRes.success) {
                            var oldTransaction = transRes.data;
                            
                            // Chỉ hoàn trả nếu cùng ví
                            if (oldTransaction.walletId == walletId) {
                                if (oldTransaction.type === 'Income') {
                                    currentBalance -= oldTransaction.amount;
                                } else if (oldTransaction.type === 'Expense') {
                                    currentBalance += oldTransaction.amount;
                                }
                            }

                            // Kiểm tra số dư sau khi hoàn trả
                            if (currentBalance < amountNumeric) {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Số dư không đủ!',
                                    confirmButtonText: 'Đóng'
                                });
                                return;
                            }
                            submitTransaction(url, id, isNew, amountNumeric, categoryId, walletId, transDate, type);
                        }
                    }).fail(function () {
                        Swal.fire('Lỗi', 'Không thể kiểm tra giao dịch cũ', 'error');
                    });
                } else {
                    // Thêm mới: Chỉ cần kiểm tra số dư hiện tại
                    if (currentBalance < amountNumeric) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Số dư không đủ!',
                            confirmButtonText: 'Đóng'
                        });
                        return;
                    }
                    submitTransaction(url, id, isNew, amountNumeric, categoryId, walletId, transDate, type);
                }
            } else {
                Swal.fire('Lỗi', walletRes.message || 'Không thể lấy thông tin ví', 'error');
            }
        }).fail(function () {
            Swal.fire('Lỗi', 'Không thể kết nối server', 'error');
        });
    } else {
        // Khoản thu: Submit trực tiếp
        submitTransaction(url, id, isNew, amountNumeric, categoryId, walletId, transDate, type);
    }
});

function submitTransaction(url, id, isNew, amountNumeric, categoryId, walletId, transDate, type) {
    var payload = {
        TransactionId: isNew ? 0 : parseInt(id),
        Amount: parseFloat(amountNumeric),
        CategoryId: parseInt(categoryId),
        WalletId: parseInt(walletId),
        TransactionDate: transDate,
        Description: $('#transDesc').val() || '',
        Type: type
    };

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
                    text: res.message || 'Đã lưu giao dịch!',
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
}

function deleteTransaction(id) {
    Swal.fire({
        title: 'Xóa giao dịch',
        text: "Bạn chắc chắn muốn xóa giao dịch này?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            $.post('/User/Transactions/Delete/' + id, function (res) {
                if (res.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Đã xóa!',
                        text: res.message || 'Giao dịch đã bị xóa.',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire('Lỗi', res.message || 'Không thể xóa giao dịch', 'error');
                }
            }).fail(function () {
                Swal.fire('Lỗi', 'Không thể kết nối server', 'error');
            });
        }
    });
}

function applyFilter() {
    var filterWallet = $('#filterWallet').val();
    var filterType = $('#filterType').val();
    var filterFromDate = $('#filterFromDate').val();
    var filterToDate = $('#filterToDate').val();

    console.log('Filter values:', { filterWallet, filterType, filterFromDate, filterToDate });

    if (filterWallet || filterFromDate || filterToDate) {
        var params = new URLSearchParams();
        if (filterWallet) params.append('walletId', filterWallet);
        if (filterType) params.append('type', filterType);
        if (filterFromDate) params.append('fromDate', filterFromDate);
        if (filterToDate) params.append('toDate', filterToDate);
        window.location.href = '/User/Transactions?' + params.toString();
    } else if (filterType) {
        console.log('Applying client-side filter for type:', filterType);
        $('#tableTransaction tbody tr').show();
        $('#tableTransaction tbody tr').each(function () {
            var rowType = $(this).find('td[data-type]').attr('data-type');
            console.log('Row type:', rowType, 'Filter:', filterType);
            if (rowType && rowType !== filterType) {
                $(this).hide();
            }
        });
        table.draw(false);
    } else {
        console.log('Clearing all filters - showing all rows');
        $('#tableTransaction tbody tr').show();
        table.draw(false);
    }
}

function resetFilter() {
    console.log('Resetting filters');
    $('#filterWallet').val('');
    $('#filterType').val('');
    $('#filterFromDate').val('');
    $('#filterToDate').val('');
    $('#tableTransaction tbody tr').show();
    table.search('').columns().search('').draw();
    window.history.pushState({}, '', '/User/Transactions');
    location.reload();
}