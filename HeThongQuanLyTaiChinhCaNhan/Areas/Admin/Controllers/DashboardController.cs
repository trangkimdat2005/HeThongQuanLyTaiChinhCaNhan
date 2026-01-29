using HeThongQuanLyTaiChinhCaNhan.Models;
using HeThongQuanLyTaiChinhCaNhan.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = "Admin")]
    public class DashboardController : Controller
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var now = DateTime.Now;

            // --- KHAI BÁO BIẾN THỜI GIAN CHUẨN ---

            // 1. Dành cho Transaction (Kiểu DateOnly)
            var startOfMonthDateOnly = new DateOnly(now.Year, now.Month, 1);

            // 2. Dành cho User (Kiểu DateTime)
            var startOfMonthDateTime = new DateTime(now.Year, now.Month, 1);
            var todayDateTime = now.Date; // 00:00:00 hôm nay

            // -------------------------------------

            // 1. Lấy số liệu tổng quan (chỉ đếm users chưa xóa)
            var totalUsers = await _context.Users
                .CountAsync(u => u.IsDelete == false || u.IsDelete == null);

            // SỬA: Dùng startOfMonthDateOnly và filter IsDelete
            var newTransactions = await _context.Transactions
                .Where(t => t.TransactionDate >= startOfMonthDateOnly 
                    && (t.IsDelete == false || t.IsDelete == null))
                .ToListAsync();

            // SỬA: Dùng startOfMonthDateTime và filter IsDelete
            var newUsersMonth = await _context.Users
                .CountAsync(u => u.CreatedAt >= startOfMonthDateTime 
                    && (u.IsDelete == false || u.IsDelete == null));

            // SỬA: Dùng todayDateTime và filter IsDelete
            var newUsersToday = await _context.Users
                .CountAsync(u => u.CreatedAt >= todayDateTime 
                    && (u.IsDelete == false || u.IsDelete == null));

            var pendingTickets = await _context.Tickets
                .CountAsync(t => (t.Status == "Open" || t.Status == "Pending") 
                    && (t.IsDelete == false || t.IsDelete == null));

            // 2. Tính toán Biểu đồ Tăng trưởng User (6 tháng gần nhất)
            var growthLabels = new List<string>();
            var growthData = new List<int>();

            for (int i = 5; i >= 0; i--)
            {
                var month = now.AddMonths(-i);
                // Tính ngày đầu tháng và cuối tháng kiểu DateTime cho User
                var start = new DateTime(month.Year, month.Month, 1);
                var end = start.AddMonths(1);

                var count = await _context.Users
                    .CountAsync(u => u.CreatedAt < end 
                        && (u.IsDelete == false || u.IsDelete == null));

                growthLabels.Add($"Tháng {month.Month}");
                growthData.Add(count);
            }

            // 3. Tính toán Biểu đồ Thu/Chi
            var totalIncome = newTransactions.Where(t => t.Type == "Income").Sum(t => t.Amount);
            var totalExpense = newTransactions.Where(t => t.Type == "Expense").Sum(t => t.Amount);

            // 4. Lấy danh sách 5 User mới nhất (chỉ lấy chưa xóa)
            var recentUsers = await _context.Users
                .Where(u => u.IsDelete == false || u.IsDelete == null)
                .OrderByDescending(u => u.CreatedAt)
                .Take(5)
                .ToListAsync();

            // 5. Đổ vào ViewModel
            var model = new DashboardVM
            {
                TotalUsers = totalUsers,
                NewTransactionsCount = newTransactions.Count,
                TotalVolume = newTransactions.Sum(t => t.Amount),
                NewUsersCount = newUsersMonth,
                NewUsersToday = newUsersToday,
                PendingTickets = pendingTickets,

                GrowthLabels = growthLabels,
                GrowthData = growthData,

                TotalIncome = totalIncome,
                TotalExpense = totalExpense,

                RecentUsers = recentUsers
            };

            return View(model);
        }
    }
}