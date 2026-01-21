using HeThongQuanLyTaiChinhCaNhan.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.Controllers
{
    [Area("User")]
    [Route("User/Budgets")]
    [Authorize]
    public class BudgetsController : Controller
    {
        private readonly AppDbContext _context;

        public BudgetsController(AppDbContext context)
        {
            _context = context;
        }

        private string? GetCurrentUserId()
        {
            return User.FindFirst("UserId")?.Value ?? 
                   User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        [Route("")]
        [HttpGet]
        public IActionResult Index()
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                TempData["ErrorMessage"] = "Vui lòng đăng nhập để xem ngân sách.";
                return RedirectToAction("Login", "Auth", new { area = "" });
            }

            // Load categories (chỉ Expense)
            ViewBag.categories = _context.Categories
                .AsNoTracking()
                .Where(c => c.UserId == userId && c.Type == "Expense")
                .OrderBy(c => c.CategoryName)
                .ToList();

            // Load budgets với Category included
            var budgets = _context.Budgets
                .Include(b => b.Category)
                .Where(b => b.UserId == userId)
                .OrderBy(b => b.StartDate)
                .AsNoTracking()
                .ToList();

            // Tính toán spent amount cho từng budget
            var budgetViewModels = new List<object>();

            foreach (var b in budgets)
            {
                var spent = _context.Transactions
                    .AsNoTracking()
                    .Where(t => t.UserId == userId
                           && t.CategoryId == b.CategoryId
                           && t.Type == "Expense"
                           && t.TransactionDate >= b.StartDate
                           && t.TransactionDate <= b.EndDate)
                    .Sum(t => (decimal?)t.Amount) ?? 0;

                budgetViewModels.Add(new
                {
                    Budget = b,
                    SpentAmount = spent,
                    Percentage = b.BudgetAmount > 0 ? (int)((spent / b.BudgetAmount) * 100) : 0
                });
            }

            ViewBag.budgetData = budgetViewModels;
            ViewBag.TotalBudgets = budgets.Count;

            return View("Budgets", budgets);
        }

        [HttpPost("Create")]
        public IActionResult Create([FromBody] BudgetDto dto)
        {
            if (dto == null)
            {
                return Json(new { success = false, message = "Dữ liệu không hợp lệ." });
            }

            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập để tạo ngân sách." });
            }

            try
            {
                // Validate
                if (dto.BudgetAmount <= 0)
                {
                    return Json(new { success = false, message = "Hạn mức phải lớn hơn 0." });
                }

                if (dto.CategoryId <= 0)
                {
                    return Json(new { success = false, message = "Vui lòng chọn danh mục." });
                }

                if (!DateOnly.TryParse(dto.StartDate, out DateOnly startDate) ||
                    !DateOnly.TryParse(dto.EndDate, out DateOnly endDate))
                {
                    return Json(new { success = false, message = "Ngày không hợp lệ." });
                }

                if (endDate < startDate)
                {
                    return Json(new { success = false, message = "Ngày kết thúc phải sau ngày bắt đầu." });
                }

                // Kiểm tra category có thuộc về user không
                var category = _context.Categories
                    .AsNoTracking()
                    .FirstOrDefault(c => c.CategoryId == dto.CategoryId && c.UserId == userId);

                if (category == null)
                {
                    return Json(new { success = false, message = "Danh mục không tồn tại hoặc không thuộc về bạn." });
                }

                if (category.Type != "Expense")
                {
                    return Json(new { success = false, message = "Chỉ có thể tạo ngân sách cho danh mục chi tiêu." });
                }

                // Kiểm tra trùng lặp thời gian
                var existingBudget = _context.Budgets
                    .Any(b => b.UserId == userId
                         && b.CategoryId == dto.CategoryId
                         && ((startDate >= b.StartDate && startDate <= b.EndDate) ||
                             (endDate >= b.StartDate && endDate <= b.EndDate) ||
                             (startDate <= b.StartDate && endDate >= b.EndDate)));

                if (existingBudget)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Đã có ngân sách cho danh mục này trong khoảng thời gian trùng lặp. Vui lòng chọn thời gian khác."
                    });
                }

                var budget = new Budget
                {
                    UserId = userId,
                    CategoryId = dto.CategoryId,
                    BudgetAmount = dto.BudgetAmount,
                    StartDate = startDate,
                    EndDate = endDate,
                    CreatedAt = DateTime.Now
                };

                _context.Budgets.Add(budget);
                _context.SaveChanges();

                return Json(new
                {
                    success = true,
                    message = "Tạo ngân sách thành công!",
                    budgetId = budget.BudgetId,
                    categoryName = category.CategoryName
                });
            }
            catch (DbUpdateException dbEx)
            {
                var innerMessage = dbEx.InnerException?.Message ?? dbEx.Message;
                return Json(new { success = false, message = $"Lỗi database: {innerMessage}" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        [HttpGet("GetById/{id}")]
        public IActionResult GetById(int id)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập lại." });
            }

            var budget = _context.Budgets
                .AsNoTracking()
                .FirstOrDefault(b => b.BudgetId == id && b.UserId == userId);

            if (budget != null)
            {
                var dto = new
                {
                    budgetId = budget.BudgetId,
                    categoryId = budget.CategoryId,
                    budgetAmount = budget.BudgetAmount,
                    startDate = budget.StartDate.ToString("yyyy-MM-dd"),
                    endDate = budget.EndDate.ToString("yyyy-MM-dd"),
                    createdAt = budget.CreatedAt
                };
                return Json(new { success = true, data = dto });
            }

            return Json(new { success = false, message = "Không tìm thấy ngân sách hoặc bạn không có quyền truy cập." });
        }

        [HttpPost("Update")]
        public IActionResult Update([FromBody] BudgetDto dto)
        {
            if (dto == null || dto.BudgetId <= 0)
            {
                return Json(new { success = false, message = "Dữ liệu không hợp lệ." });
            }

            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập lại." });
            }

            try
            {
                var existing = _context.Budgets
                    .FirstOrDefault(b => b.BudgetId == dto.BudgetId && b.UserId == userId);

                if (existing == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy ngân sách hoặc bạn không có quyền sửa." });
                }

                // Validate
                if (dto.BudgetAmount <= 0)
                {
                    return Json(new { success = false, message = "Hạn mức phải lớn hơn 0." });
                }

                if (dto.CategoryId <= 0)
                {
                    return Json(new { success = false, message = "Vui lòng chọn danh mục." });
                }

                if (!DateOnly.TryParse(dto.StartDate, out DateOnly startDate) ||
                    !DateOnly.TryParse(dto.EndDate, out DateOnly endDate))
                {
                    return Json(new { success = false, message = "Ngày không hợp lệ." });
                }

                if (endDate < startDate)
                {
                    return Json(new { success = false, message = "Ngày kết thúc phải sau ngày bắt đầu." });
                }

                // Kiểm tra category thuộc về user
                var category = _context.Categories
                    .AsNoTracking()
                    .FirstOrDefault(c => c.CategoryId == dto.CategoryId && c.UserId == userId);

                if (category == null)
                {
                    return Json(new { success = false, message = "Danh mục không tồn tại hoặc không thuộc về bạn." });
                }

                if (category.Type != "Expense")
                {
                    return Json(new { success = false, message = "Chỉ có thể tạo ngân sách cho danh mục chi tiêu." });
                }

                // Kiểm tra trùng lặp (exclude current budget)
                var overlapping = _context.Budgets
                    .Any(b => b.UserId == userId
                         && b.CategoryId == dto.CategoryId
                         && b.BudgetId != dto.BudgetId
                         && ((startDate >= b.StartDate && startDate <= b.EndDate) ||
                             (endDate >= b.StartDate && endDate <= b.EndDate) ||
                             (startDate <= b.StartDate && endDate >= b.EndDate)));

                if (overlapping)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Thời gian trùng với ngân sách khác của cùng danh mục. Vui lòng chọn thời gian khác."
                    });
                }

                // Cập nhật
                existing.CategoryId = dto.CategoryId;
                existing.BudgetAmount = dto.BudgetAmount;
                existing.StartDate = startDate;
                existing.EndDate = endDate;

                _context.SaveChanges();

                return Json(new
                {
                    success = true,
                    message = "Cập nhật ngân sách thành công!",
                    categoryName = category.CategoryName
                });
            }
            catch (DbUpdateException dbEx)
            {
                var innerMessage = dbEx.InnerException?.Message ?? dbEx.Message;
                return Json(new { success = false, message = $"Lỗi database: {innerMessage}" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi khi cập nhật: {ex.Message}" });
            }
        }

        [HttpPost("Delete/{id}")]
        public IActionResult Delete(int id)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập lại." });
            }

            try
            {
                var budget = _context.Budgets
                    .Include(b => b.Category)
                    .FirstOrDefault(b => b.BudgetId == id && b.UserId == userId);

                if (budget == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy ngân sách hoặc bạn không có quyền xóa." });
                }

                var categoryName = budget.Category?.CategoryName ?? "Unknown";

                _context.Budgets.Remove(budget);
                _context.SaveChanges();

                return Json(new
                {
                    success = true,
                    message = $"Đã xóa ngân sách cho danh mục '{categoryName}' thành công."
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi khi xóa: {ex.Message}" });
            }
        }

        /// Lấy số tiền đã chi tiêu của một budget
        [HttpGet("GetSpentAmount/{budgetId}")]
        public IActionResult GetSpentAmount(int budgetId)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập lại." });
            }

            try
            {
                var budget = _context.Budgets
                    .Include(b => b.Category)
                    .AsNoTracking()
                    .FirstOrDefault(b => b.BudgetId == budgetId && b.UserId == userId);

                if (budget == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy ngân sách." });
                }

                var spent = _context.Transactions
                    .AsNoTracking()
                    .Where(t => t.UserId == userId
                           && t.CategoryId == budget.CategoryId
                           && t.Type == "Expense"
                           && t.TransactionDate >= budget.StartDate
                           && t.TransactionDate <= budget.EndDate)
                    .Sum(t => (decimal?)t.Amount) ?? 0;

                var remaining = budget.BudgetAmount - spent;
                var percentage = budget.BudgetAmount > 0 ? (int)((spent / budget.BudgetAmount) * 100) : 0;

                return Json(new
                {
                    success = true,
                    categoryName = budget.Category?.CategoryName,
                    spentAmount = spent,
                    budgetAmount = budget.BudgetAmount,
                    remaining = remaining,
                    percentage = percentage,
                    status = percentage >= 100 ? "Vượt ngân sách" : 
                            percentage >= 80 ? "Gần hết" : "Bình thường"
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        /// Lấy thống kê tất cả budgets của user
        [HttpGet("GetStatistics")]
        public IActionResult GetStatistics()
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập lại." });
            }

            try
            {
                var today = DateOnly.FromDateTime(DateTime.Now);
                
                var activeBudgets = _context.Budgets
                    .Include(b => b.Category)
                    .Where(b => b.UserId == userId && b.StartDate <= today && b.EndDate >= today)
                    .AsNoTracking()
                    .ToList();

                var totalBudget = activeBudgets.Sum(b => b.BudgetAmount);
                var totalSpent = 0m;

                foreach (var budget in activeBudgets)
                {
                    var spent = _context.Transactions
                        .AsNoTracking()
                        .Where(t => t.UserId == userId
                               && t.CategoryId == budget.CategoryId
                               && t.Type == "Expense"
                               && t.TransactionDate >= budget.StartDate
                               && t.TransactionDate <= budget.EndDate)
                        .Sum(t => (decimal?)t.Amount) ?? 0;
                    
                    totalSpent += spent;
                }

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        activeBudgetsCount = activeBudgets.Count,
                        totalBudget = totalBudget,
                        totalSpent = totalSpent,
                        remaining = totalBudget - totalSpent,
                        percentage = totalBudget > 0 ? (int)((totalSpent / totalBudget) * 100) : 0
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }
    }

  
    public class BudgetDto
    {
        public int BudgetId { get; set; }
        public int CategoryId { get; set; }
        public decimal BudgetAmount { get; set; }
        public string StartDate { get; set; } = "";
        public string EndDate { get; set; } = "";
    }
}
