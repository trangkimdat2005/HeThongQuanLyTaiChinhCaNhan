document.addEventListener("DOMContentLoaded", function () {

    // --- 1. BIỂU ĐỒ TĂNG TRƯỞNG USER ---
    const ctxUserGrowth = document.getElementById('userGrowthChart');
    if (ctxUserGrowth) {
        var gradientFill = ctxUserGrowth.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradientFill.addColorStop(0, 'rgba(59, 125, 221, 0.2)');
        gradientFill.addColorStop(1, 'rgba(255, 255, 255, 0)');

        new Chart(ctxUserGrowth, {
            type: 'line',
            data: {
                labels: growthLabels, // Biến từ View
                datasets: [{
                    label: 'Tổng User Active',
                    data: growthData, // Biến từ View
                    backgroundColor: gradientFill,
                    borderColor: '#3b7ddd',
                    borderWidth: 3,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#3b7ddd',
                    pointHoverBackgroundColor: '#3b7ddd',
                    pointHoverBorderColor: '#ffffff',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { grid: { borderDash: [5, 5] }, beginAtZero: true }
                }
            }
        });
    }

    // --- 2. BIỂU ĐỒ THU CHI ---
    const ctxTransactionType = document.getElementById('transactionTypeChart');
    if (ctxTransactionType) {
        new Chart(ctxTransactionType, {
            type: 'doughnut',
            data: {
                labels: ['Tổng Thu (Income)', 'Tổng Chi (Expense)'],
                datasets: [{
                    data: [incomeData, expenseData], // Biến từ View
                    backgroundColor: ['#1cc88a', '#e74a3b'],
                    hoverOffset: 5,
                    borderWidth: 2
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { usePointStyle: true, padding: 20 }
                    }
                },
                cutout: '70%'
            }
        });
    }
});