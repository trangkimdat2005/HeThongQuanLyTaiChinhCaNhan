// 1. BIỂU ĐỒ DÒNG TIỀN (CHART.JS)
document.addEventListener("DOMContentLoaded", function () {
    // Chỉ chạy nếu có element id="cashFlowChart"
    var ctx = document.getElementById("cashFlowChart");
    if (ctx) {
        // Sử dụng dữ liệu từ View (được truyền từ Controller)
        var labels = typeof chartLabels !== 'undefined' ? chartLabels : ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
        var incomeData = typeof chartIncomeData !== 'undefined' ? chartIncomeData : [0, 0, 0, 0, 0, 0, 0];
        var expenseData = typeof chartExpenseData !== 'undefined' ? chartExpenseData : [0, 0, 0, 0, 0, 0, 0];

        var myLineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: "Thu Nhập",
                    tension: 0.3, // Độ cong
                    backgroundColor: "rgba(28, 200, 138, 0.05)",
                    borderColor: "rgba(28, 200, 138, 1)",
                    pointRadius: 3,
                    pointBackgroundColor: "rgba(28, 200, 138, 1)",
                    pointBorderColor: "rgba(28, 200, 138, 1)",
                    pointHoverRadius: 3,
                    pointHoverBackgroundColor: "rgba(28, 200, 138, 1)",
                    pointHoverBorderColor: "rgba(28, 200, 138, 1)",
                    pointHitRadius: 10,
                    pointBorderWidth: 2,
                    data: incomeData,
                },
                {
                    label: "Chi Tiêu",
                    tension: 0.3,
                    backgroundColor: "rgba(231, 74, 59, 0.05)",
                    borderColor: "rgba(231, 74, 59, 1)",
                    pointRadius: 3,
                    pointBackgroundColor: "rgba(231, 74, 59, 1)",
                    pointBorderColor: "rgba(231, 74, 59, 1)",
                    pointHoverRadius: 3,
                    pointHoverBackgroundColor: "rgba(231, 74, 59, 1)",
                    pointHoverBorderColor: "rgba(231, 74, 59, 1)",
                    pointHitRadius: 10,
                    pointBorderWidth: 2,
                    data: expenseData,
                }],
            },
            options: {
                maintainAspectRatio: false,
                layout: { padding: { left: 10, right: 25, top: 25, bottom: 0 } },
                scales: {
                    x: { grid: { display: false, drawBorder: false } },
                    y: {
                        grid: { color: "rgb(234, 236, 244)", drawBorder: false, borderDash: [2], zeroLineBorderDash: [2] },
                        ticks: {
                            callback: function (value) { 
                                return value.toLocaleString('vi-VN') + ' đ'; 
                            }
                        }
                    }
                },
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                var label = context.dataset.label || '';
                                if (label) { label += ': '; }
                                label += context.parsed.y.toLocaleString('vi-VN') + ' đ';
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
});

// 2. HÀM THÊM GIAO DỊCH NHANH (Mở Modal sau này)
function quickAddTransaction() {
    Swal.fire({
        title: 'Ghi chép nhanh',
        text: 'Tính năng thêm giao dịch sẽ mở ở đây',
        icon: 'info',
        confirmButtonText: 'Đến trang Thêm Giao Dịch'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/User/Transactions';
        }
    });
}

// 3. HÀM LỌC GIAO DỊCH THEO THỜI GIAN
function filterTransactions(filterType) {
    const rows = document.querySelectorAll('#transactionTableBody tr');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Tính toán ngày bắt đầu tuần (Thứ 2)
    const weekStart = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Nếu CN thì lùi 6 ngày, còn lại lùi (dayOfWeek - 1) ngày
    weekStart.setDate(today.getDate() - diff);
    
    let visibleCount = 0;
    
    rows.forEach(row => {
        const dateCell = row.querySelector('td:first-child');
        if (!dateCell) return;
        
        const dateText = dateCell.textContent.trim();
        const [day, month] = dateText.split('/').map(Number);
        const currentYear = today.getFullYear();
        const transDate = new Date(currentYear, month - 1, day);
        transDate.setHours(0, 0, 0, 0);
        
        let shouldShow = false;
        
        switch(filterType) {
            case 'all':
                shouldShow = true;
                break;
            case 'today':
                shouldShow = transDate.getTime() === today.getTime();
                break;
            case 'week':
                shouldShow = transDate >= weekStart && transDate <= today;
                break;
        }
        
        if (shouldShow) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Hiển thị thông báo nếu không có giao dịch
    const emptyRow = document.querySelector('#transactionTableBody .no-transactions-row');
    if (emptyRow) {
        emptyRow.style.display = visibleCount === 0 ? '' : 'none';
    }
    
    // Cập nhật text button đang active
    const filterButton = document.querySelector('.filter-dropdown-toggle');
    const filterTexts = {
        'all': 'Toàn bộ',
        'today': 'Hôm nay',
        'week': 'Tuần này'
    };
    
    if (filterButton) {
        filterButton.innerHTML = `<i class="fas fa-filter me-1 text-muted"></i> ${filterTexts[filterType] || 'Lọc'}`;
    }
    
    // Toast thông báo
    const toastTexts = {
        'all': `Hiển thị tất cả ${visibleCount} giao dịch`,
        'today': `Tìm thấy ${visibleCount} giao dịch hôm nay`,
        'week': `Tìm thấy ${visibleCount} giao dịch tuần này`
    };
    
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: toastTexts[filterType],
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }
}