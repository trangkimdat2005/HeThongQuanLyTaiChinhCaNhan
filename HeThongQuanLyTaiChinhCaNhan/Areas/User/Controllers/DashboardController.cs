using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HeThongQuanLyTaiChinhCaNhan.Models;
using HeThongQuanLyTaiChinhCaNhan.ViewModels;
using System.Security.Claims;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.Controllers
{
    [Area("User")]
    [Route("User/Dashboard")]
    [Authorize(Roles = "User")]
    public class DashboardController : Controller
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (string.IsNullOrEmpty(userId))
            {
                return RedirectToAction("Login", "Auth", new { area = "" });
            }

            var now = DateTime.Now;
            var startOfMonth = new DateOnly(now.Year, now.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);
            var today = DateOnly.FromDateTime(now);
            var sevenDaysAgo = today.AddDays(-6);

            var model = new UserDashboardVM();

            // 1. Lấy tổng tài sản (tổng số dư các ví)
            model.TotalAssets = await _context.Wallets
                .Where(w => w.UserId == userId)
                .SumAsync(w => w.Balance ?? 0);

            // 2. Thu nhập tháng này
            var monthlyIncomeTransactions = await _context.Transactions
                .Where(t => t.UserId == userId
                    && t.Type == "Income"
                    && t.TransactionDate >= startOfMonth)
                .ToListAsync();

            model.MonthlyIncome = monthlyIncomeTransactions.Sum(t => t.Amount);
            model.NewIncomeCount = monthlyIncomeTransactions.Count;

            // 3. Chi tiêu tháng này
            var monthlyExpenseTransactions = await _context.Transactions
                .Where(t => t.UserId == userId
                    && t.Type == "Expense"
                    && t.TransactionDate >= startOfMonth)
                .ToListAsync();

            model.MonthlyExpense = monthlyExpenseTransactions.Sum(t => t.Amount);

            // 4. Tính % tăng trưởng tài sản (so với tháng trước)
            var lastMonth = startOfMonth.AddMonths(-1);
            var lastMonthEnd = startOfMonth.AddDays(-1);

            var lastMonthTransactions = await _context.Transactions
                .Where(t => t.UserId == userId
                    && t.TransactionDate >= lastMonth
                    && t.TransactionDate <= lastMonthEnd)
                .ToListAsync();

            var lastMonthIncome = lastMonthTransactions.Where(t => t.Type == "Income").Sum(t => t.Amount);
            var lastMonthExpense = lastMonthTransactions.Where(t => t.Type == "Expense").Sum(t => t.Amount);
            var lastMonthNet = lastMonthIncome - lastMonthExpense;
            var currentMonthNet = model.MonthlyIncome - model.MonthlyExpense;

            if (lastMonthNet > 0)
            {
                model.AssetGrowthPercent = Math.Round(((currentMonthNet - lastMonthNet) / lastMonthNet) * 100, 1);
            }

            // 5. Tính % sử dụng ngân sách (dựa trên StartDate và EndDate)
            var totalBudget = await _context.Budgets
                .Where(b => b.UserId == userId
                    && b.StartDate <= today
                    && b.EndDate >= today)
                .SumAsync(b => b.BudgetAmount);

            if (totalBudget > 0)
            {
                model.BudgetUsedPercent = Math.Round((model.MonthlyExpense / totalBudget) * 100, 0);
            }

            // 6. Dữ liệu biểu đồ dòng tiền (7 ngày qua)
            var cashFlowTransactions = await _context.Transactions
                .Where(t => t.UserId == userId
                    && t.TransactionDate >= sevenDaysAgo
                    && t.TransactionDate <= today)
                .ToListAsync();

            for (int i = 6; i >= 0; i--)
            {
                var date = today.AddDays(-i);
                model.CashFlowLabels.Add(date.ToString("dd/MM"));

                var dayIncome = cashFlowTransactions
                    .Where(t => t.TransactionDate == date && t.Type == "Income")
                    .Sum(t => t.Amount);

                var dayExpense = cashFlowTransactions
                    .Where(t => t.TransactionDate == date && t.Type == "Expense")
                    .Sum(t => t.Amount);

                model.CashFlowIncomeData.Add(dayIncome);
                model.CashFlowExpenseData.Add(dayExpense);
            }

            // 7. Danh sách ví
            model.Wallets = await _context.Wallets
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.Balance)
                .Take(3)
                .Select(w => new WalletDisplayVM
                {
                    WalletId = w.WalletId,
                    WalletName = w.WalletName,
                    WalletType = w.WalletType,
                    Icon = w.Icon,
                    Balance = w.Balance ?? 0,
                    IsActive = true
                })
                .ToListAsync();

            // 8. Giao dịch gần đây
            model.RecentTransactions = await _context.Transactions
                .Where(t => t.UserId == userId)
                .Include(t => t.Category)
                .Include(t => t.Wallet)
                .OrderByDescending(t => t.TransactionDate)
                .ThenByDescending(t => t.CreatedAt)
                .Take(4)
                .Select(t => new TransactionDisplayVM
                {
                    TransactionId = t.TransactionId,
                    TransactionDate = t.TransactionDate,
                    CategoryName = t.Category.CategoryName,
                    CategoryIcon = t.Category.Icon ?? "fa-question",
                    CategoryColor = t.Category.Color ?? "#6c757d",
                    Description = t.Description ?? "",
                    WalletName = t.Wallet.WalletName,
                    Amount = t.Amount,
                    Type = t.Type
                })
                .ToListAsync();

            return View(model);
        }
    }
}