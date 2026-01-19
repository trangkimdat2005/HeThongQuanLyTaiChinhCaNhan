// 1. BIỂU ĐỒ DÒNG TIỀN (CHART.JS)
document.addEventListener("DOMContentLoaded", function () {
    // Chỉ chạy nếu có element id="cashFlowChart"
    var ctx = document.getElementById("cashFlowChart");
    if (ctx) {
        var myLineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"], // Các ngày trong tuần
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
                    data: [0, 15000000, 0, 0, 0, 200000, 0], // Dữ liệu giả (Lương về T3)
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
                    data: [50000, 150000, 450000, 100000, 20000, 500000, 80000], // Dữ liệu giả ăn uống, xăng xe...
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
                            callback: function (value) { return value.toLocaleString('vi-VN') + 'đ'; }
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
            window.location.href = '/user/transactions.html';
        }
    });
}