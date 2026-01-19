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

            // 1. Lấy số liệu tổng quan
            var totalUsers = await _context.Users.CountAsync();

            // SỬA: Dùng startOfMonthDateOnly
            var newTransactions = await _context.Transactions
                .Where(t => t.TransactionDate >= startOfMonthDateOnly)
                .ToListAsync();

            // SỬA: Dùng startOfMonthDateTime
            var newUsersMonth = await _context.Users
                .CountAsync(u => u.CreatedAt >= startOfMonthDateTime);

            // SỬA: Dùng todayDateTime
            var newUsersToday = await _context.Users
                .CountAsync(u => u.CreatedAt >= todayDateTime);

            var pendingTickets = await _context.Tickets
                .CountAsync(t => t.Status == "Open" || t.Status == "Pending");

            // 2. Tính toán Biểu đồ Tăng trưởng User (6 tháng gần nhất)
            var growthLabels = new List<string>();
            var growthData = new List<int>();

            for (int i = 5; i >= 0; i--)
            {
                var month = now.AddMonths(-i);
                // Tính ngày đầu tháng và cuối tháng kiểu DateTime cho User
                var start = new DateTime(month.Year, month.Month, 1);
                var end = start.AddMonths(1);

                var count = await _context.Users.CountAsync(u => u.CreatedAt < end);

                growthLabels.Add($"Tháng {month.Month}");
                growthData.Add(count);
            }

            // 3. Tính toán Biểu đồ Thu/Chi
            var totalIncome = newTransactions.Where(t => t.Type == "Income").Sum(t => t.Amount);
            var totalExpense = newTransactions.Where(t => t.Type == "Expense").Sum(t => t.Amount);

            // 4. Lấy danh sách 5 User mới nhất
            var recentUsers = await _context.Users
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