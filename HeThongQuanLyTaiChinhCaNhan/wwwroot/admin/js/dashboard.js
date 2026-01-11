// 1. Biểu đồ đường: Tăng trưởng User (Line Chart)
const ctxUserGrowth = document.getElementById('userGrowthChart').getContext('2d');
// Tạo màu gradient cho đẹp
var gradientFill = ctxUserGrowth.createLinearGradient(0, 0, 0, 300);
gradientFill.addColorStop(0, 'rgba(59, 125, 221, 0.2)'); // Màu xanh ở trên
gradientFill.addColorStop(1, 'rgba(255, 255, 255, 0)');   // Mờ dần xuống dưới

new Chart(ctxUserGrowth, {
    type: 'line',
    data: {
        labels: ['Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12', 'Tháng 1'],
        datasets: [{
            label: 'Tổng User Active',
            data: [850, 920, 1050, 1100, 1180, 1250], // Số liệu giả định
            backgroundColor: gradientFill,
            borderColor: '#3b7ddd', // Màu đường kẻ xanh dương
            borderWidth: 3,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#3b7ddd',
            pointHoverBackgroundColor: '#3b7ddd',
            pointHoverBorderColor: '#ffffff',
            fill: true,
            tension: 0.4 // Độ cong của đường
        }]
    },
    options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }, // Ẩn chú thích vì chỉ có 1 đường
        scales: {
            x: { grid: { display: false } },
            y: { grid: { borderDash: [5, 5] }, beginAtZero: false } // Kẻ nét đứt trục Y
        }
    }
});

// 2. Biểu đồ tròn: Tỷ lệ Thu/Chi (Doughnut Chart)
const ctxTransactionType = document.getElementById('transactionTypeChart').getContext('2d');
new Chart(ctxTransactionType, {
    type: 'doughnut',
    data: {
        labels: ['Tổng Khoản Thu (Income)', 'Tổng Khoản Chi (Expense)'],
        datasets: [{
            data: [65, 35], // Tỷ lệ giả định 65% Thu - 35% Chi
            backgroundColor: [
                '#1cc88a', // Màu xanh lá (Thu)
                '#e74a3b'  // Màu đỏ (Chi)
            ],
            hoverOffset: 5, // Hiệu ứng khi di chuột vào
            borderWidth: 2
        }]
    },
    options: {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom', // Đặt chú thích xuống dưới
                labels: { usePointStyle: true, padding: 20 }
            }
        },
        cutout: '70%' // Độ rỗng ở giữa (làm cho nó thành hình bánh Donut)
    }
});