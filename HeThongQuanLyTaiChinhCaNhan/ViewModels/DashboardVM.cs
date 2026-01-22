namespace HeThongQuanLyTaiChinhCaNhan.ViewModels
{
    // ViewModel cho User Dashboard
    public class UserDashboardVM
    {
        // Thống kê tổng quan
        public decimal TotalAssets { get; set; }
        public decimal MonthlyIncome { get; set; }
        public decimal MonthlyExpense { get; set; }
        public decimal AssetGrowthPercent { get; set; }
        public decimal BudgetUsedPercent { get; set; }
        public int NewIncomeCount { get; set; }

        // Dữ liệu biểu đồ dòng tiền (7 ngày qua)
        public List<string> CashFlowLabels { get; set; } = new List<string>();
        public List<decimal> CashFlowIncomeData { get; set; } = new List<decimal>();
        public List<decimal> CashFlowExpenseData { get; set; } = new List<decimal>();

        // Danh sách ví
        public List<WalletDisplayVM> Wallets { get; set; } = new List<WalletDisplayVM>();

        // Giao dịch gần đây
        public List<TransactionDisplayVM> RecentTransactions { get; set; } = new List<TransactionDisplayVM>();
    }

    // ViewModel cho Admin Dashboard  
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
        public List<Models.User> RecentUsers { get; set; } = new List<Models.User>();
    }

    public class WalletDisplayVM
    {
        public int WalletId { get; set; }
        public string WalletName { get; set; } = string.Empty;
        public string WalletType { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public decimal Balance { get; set; }
        public bool IsActive { get; set; }
    }

    public class TransactionDisplayVM
    {
        public int TransactionId { get; set; }
        public DateOnly TransactionDate { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string CategoryIcon { get; set; } = string.Empty;
        public string CategoryColor { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string WalletName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Type { get; set; } = string.Empty;
    }
}