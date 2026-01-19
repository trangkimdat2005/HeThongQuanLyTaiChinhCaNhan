using HeThongQuanLyTaiChinhCaNhan.Models;

namespace HeThongQuanLyTaiChinhCaNhan.ViewModels
{
    public class DashboardVM
    {
        // 1. Thống kê Card trên cùng
        public int TotalUsers { get; set; }
        public int NewTransactionsCount { get; set; } // Số giao dịch trong tháng
        public decimal TotalVolume { get; set; }      // Tổng tiền giao dịch trong tháng
        public int NewUsersCount { get; set; }        // Số user mới trong tháng
        public int NewUsersToday { get; set; }        // Số user mới hôm nay
        public int PendingTickets { get; set; }       // Ticket đang chờ xử lý

        // 2. Dữ liệu cho Biểu đồ User Growth (6 tháng gần nhất)
        public List<string> GrowthLabels { get; set; } = new List<string>(); // ["Tháng 8", "Tháng 9"...]
        public List<int> GrowthData { get; set; } = new List<int>();         // [10, 25, 40...]

        // 3. Dữ liệu cho Biểu đồ Thu/Chi (Toàn hệ thống - Tháng hiện tại)
        public decimal TotalIncome { get; set; }
        public decimal TotalExpense { get; set; }

        // 4. Danh sách User mới đăng ký (Cho bảng bên dưới)
        public List<User> RecentUsers { get; set; } = new List<User>();
    }
}
