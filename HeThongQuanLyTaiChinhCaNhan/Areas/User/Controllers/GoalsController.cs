using HeThongQuanLyTaiChinhCaNhan.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.Controllers
{
    [Area("User")]
    [Route("User/Goals")]
    [Authorize]
    public class GoalsController : Controller
    {
        private readonly AppDbContext _context;

        public GoalsController(AppDbContext context)
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
                TempData["ErrorMessage"] = "Vui lòng đăng nhập để xem mục tiêu.";
                return RedirectToAction("Login", "Auth", new { area = "" });
            }

            var goals = _context.Goals
                .Where(g => g.UserId == userId)
                .OrderByDescending(g => g.CreatedAt)
                .AsNoTracking()
                .ToList();

            ViewBag.Wallets = _context.Wallets
                .AsNoTracking()
                .Where(w => w.UserId == userId)
                .OrderBy(w => w.WalletName)
                .ToList();

            return View("Goals", goals);
        }

        [HttpGet("GetAll")]
        public IActionResult GetAll()
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập lại." });
            }

            try
            {
                var goals = _context.Goals
                    .AsNoTracking()
                    .Where(g => g.UserId == userId)
                    .OrderByDescending(g => g.CreatedAt)
                    .Select(g => new
                    {
                        id = g.GoalId,
                        name = g.GoalName,
                        target = g.TargetAmount,
                        current = g.CurrentAmount,
                        status = g.Status,
                        createdAt = g.CreatedAt
                    })
                    .ToList();

                return Json(new { success = true, data = goals });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }
  
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
                var goals = _context.Goals
                    .AsNoTracking()
                    .Where(g => g.UserId == userId)
                    .ToList();

                var totalSaved = goals.Sum(g => g.CurrentAmount ?? 0);
                var totalTarget = goals.Sum(g => g.TargetAmount);
                var totalPercent = totalTarget > 0 ? (int)((totalSaved / totalTarget) * 100) : 0;

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        totalSaved = totalSaved,
                        totalTarget = totalTarget,
                        totalPercent = totalPercent,
                        activeGoals = goals.Count(g => g.Status == "Đang thực hiện"),
                        completedGoals = goals.Count(g => g.Status == "Hoàn thành")
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        [HttpPost("Create")]
        public IActionResult Create([FromBody] GoalDto dto)
        {
            if (dto == null)
            {
                return Json(new { success = false, message = "Dữ liệu không hợp lệ." });
            }

            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập để tạo mục tiêu." });
            }

            try
            {
                // Validate
                if (string.IsNullOrWhiteSpace(dto.GoalName))
                {
                    return Json(new { success = false, message = "Tên mục tiêu không được để trống." });
                }

                if (dto.TargetAmount <= 0)
                {
                    return Json(new { success = false, message = "Số tiền mục tiêu phải lớn hơn 0." });
                }

                var goal = new Goal
                {
                    UserId = userId,
                    GoalName = dto.GoalName.Trim(),
                    TargetAmount = dto.TargetAmount,
                    CurrentAmount = 0,
                    Status = string.IsNullOrEmpty(dto.Status) ? "Đang thực hiện" : dto.Status,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                _context.Goals.Add(goal);
                _context.SaveChanges();

                return Json(new
                {
                    success = true,
                    message = $"Đã tạo mục tiêu '{goal.GoalName}' thành công!",
                    goalId = goal.GoalId
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

            var goal = _context.Goals
                .AsNoTracking()
                .FirstOrDefault(g => g.GoalId == id && g.UserId == userId);

            if (goal != null)
            {
                var dto = new
                {
                    goalId = goal.GoalId,
                    goalName = goal.GoalName,
                    targetAmount = goal.TargetAmount,
                    currentAmount = goal.CurrentAmount,
                    status = goal.Status,
                    createdAt = goal.CreatedAt,
                    updatedAt = goal.UpdatedAt
                };
                return Json(new { success = true, data = dto });
            }

            return Json(new { success = false, message = "Không tìm thấy mục tiêu hoặc bạn không có quyền truy cập." });
        }

        [HttpPost("Update")]
        public IActionResult Update([FromBody] GoalDto dto)
        {
            if (dto == null || dto.GoalId <= 0)
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
                var existing = _context.Goals
                    .FirstOrDefault(g => g.GoalId == dto.GoalId && g.UserId == userId);

                if (existing == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy mục tiêu hoặc bạn không có quyền sửa." });
                }

                if (string.IsNullOrWhiteSpace(dto.GoalName))
                {
                    return Json(new { success = false, message = "Tên mục tiêu không được để trống." });
                }

                if (dto.TargetAmount <= 0)
                {
                    return Json(new { success = false, message = "Số tiền mục tiêu phải lớn hơn 0." });
                }

                var currentAmount = existing.CurrentAmount ?? 0;
                if (dto.TargetAmount < currentAmount)
                {
                    return Json(new
                    {
                        success = false,
                        message = $"Số tiền mục tiêu phải lớn hơn hoặc bằng số tiền đã nạp ({currentAmount.ToString("N0")}đ)."
                    });
                }

                var targetChanged = dto.TargetAmount != existing.TargetAmount;

                if (existing.Status == "Hoàn thành")
                {
                    
                    if (!targetChanged && dto.Status != "Hoàn thành")
                    {
                        return Json(new
                        {
                            success = false,
                            message = "Không thể thay đổi trạng thái khỏi 'Hoàn thành' khi số tiền mục tiêu không thay đổi. Vui lòng tăng số tiền mục tiêu nếu muốn tiếp tục."
                        });
                    }
                    if (targetChanged && dto.TargetAmount > existing.TargetAmount && dto.Status == "Hoàn thành")
                    {
                        return Json(new
                        {
                            success = false,
                            message = "Khi tăng số tiền mục tiêu, trạng thái không thể là 'Hoàn thành'. Vui lòng chọn 'Đang thực hiện' hoặc 'Tạm dừng'."
                        });
                    }
                }

                if (dto.Status == "Hoàn thành" && currentAmount < dto.TargetAmount)
                {
                    return Json(new
                    {
                        success = false,
                        message = $"Không thể đặt trạng thái 'Hoàn thành' khi số tiền đã nạp ({currentAmount.ToString("N0")}đ) còn thiếu {(dto.TargetAmount - currentAmount).ToString("N0")}đ so với mục tiêu."
                    });
                }

                // Cập nhật
                existing.GoalName = dto.GoalName.Trim();
                existing.TargetAmount = dto.TargetAmount;
                existing.Status = dto.Status;
                existing.UpdatedAt = DateTime.Now;

                if (currentAmount >= dto.TargetAmount && dto.Status != "Tạm dừng")
                {
                    existing.Status = "Hoàn thành";
                }

                _context.SaveChanges();

                return Json(new
                {
                    success = true,
                    message = $"Cập nhật mục tiêu '{existing.GoalName}' thành công!",
                    newStatus = existing.Status,
                    isCompleted = existing.Status == "Hoàn thành"
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
                var goal = _context.Goals
                    .FirstOrDefault(g => g.GoalId == id && g.UserId == userId);

                if (goal == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy mục tiêu hoặc bạn không có quyền xóa." });
                }

                var goalName = goal.GoalName;

                var hasDeposits = _context.GoalDeposits.Any(gd => gd.GoalId == id);

                if (hasDeposits)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Không thể xóa mục tiêu này vì đang có lịch sử nạp tiền."
                    });
                }

                _context.Goals.Remove(goal);
                _context.SaveChanges();

                return Json(new
                {
                    success = true,
                    message = $"Đã xóa mục tiêu '{goalName}' thành công."
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi khi xóa: {ex.Message}" });
            }
        }

        /// Nạp tiền vào mục tiêu (deposit)
   
        [HttpPost("Deposit")]
        public IActionResult Deposit([FromBody] DepositDto dto)
        {
            if (dto == null)
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
                if (dto.Amount <= 0)
                {
                    return Json(new { success = false, message = "Số tiền nạp phải lớn hơn 0." });
                }

                if (string.IsNullOrWhiteSpace(dto.Status))
                {
                    dto.Status = "Đang thực hiện";
                }

                if (dto.Status != "Đang thực hiện" && dto.Status != "Tạm dừng")
                {
                    return Json(new
                    {
                        success = false,
                        message = "Trạng thái không hợp lệ. Chỉ cho phép 'Đang thực hiện' hoặc 'Tạm dừng'."
                    });
                }

                var goal = _context.Goals
                    .FirstOrDefault(g => g.GoalId == dto.GoalId && g.UserId == userId);

                if (goal == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy mục tiêu." });
                }

                if (goal.Status == "Hoàn thành")
                {
                    return Json(new { success = false, message = "Mục tiêu đã hoàn thành, không thể nạp thêm." });
                }

                if (goal.Status == "Tạm dừng")
                {
                    return Json(new
                    {
                        success = false,
                        message = "Mục tiêu đang ở trạng thái 'Tạm dừng'. Vui lòng chuyển sang trạng thái 'Đang thực hiện' trước khi nạp tiền."
                    });
                }

                var currentAmount = goal.CurrentAmount ?? 0;
                var remaining = goal.TargetAmount - currentAmount;

                if (dto.Amount > remaining)
                {
                    return Json(new
                    {
                        success = false,
                        message = $"Số tiền nạp vượt quá số tiền còn thiếu. Bạn chỉ cần nạp tối đa {remaining.ToString("N0")}đ để hoàn thành mục tiêu."
                    });
                }

                // Kiểm tra Wallet
                var wallet = _context.Wallets
                    .FirstOrDefault(w => w.WalletId == dto.WalletId && w.UserId == userId);

                if (wallet == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy ví hoặc ví không thuộc về bạn." });
                }

                if ((wallet.Balance ?? 0) < dto.Amount)
                {
                    return Json(new { success = false, message = "Số dư ví không đủ để nạp." });
                }

                using var transaction = _context.Database.BeginTransaction();
                try
                {
                    var deposit = new GoalDeposit
                    {
                        GoalId = dto.GoalId,
                        UserId = userId,
                        WalletId = dto.WalletId,
                        Amount = dto.Amount,
                        Note = dto.Note ?? "",
                        DepositDate = DateTime.Now
                    };

                    _context.GoalDeposits.Add(deposit);

                    goal.CurrentAmount = currentAmount + dto.Amount;
                    goal.UpdatedAt = DateTime.Now;

                    if (goal.CurrentAmount >= goal.TargetAmount)
                    {
                        goal.Status = "Hoàn thành";
                    }
                    else
                    {
                        goal.Status = dto.Status;
                    }

                    wallet.Balance = (wallet.Balance ?? 0) - dto.Amount;
                    wallet.UpdatedAt = DateTime.Now;

                    _context.SaveChanges();
                    transaction.Commit();

                    var isCompleted = goal.Status == "Hoàn thành";

                    return Json(new
                    {
                        success = true,
                        message = isCompleted 
                            ? $"Chúc mừng! Bạn đã hoàn thành mục tiêu '{goal.GoalName}'!" 
                            : $"Đã nạp {dto.Amount.ToString("N0")}đ vào mục tiêu '{goal.GoalName}'. Trạng thái: {goal.Status}",
                        isCompleted = isCompleted,
                        newCurrentAmount = goal.CurrentAmount,
                        newWalletBalance = wallet.Balance,
                        newStatus = goal.Status,
                        remaining = goal.TargetAmount - goal.CurrentAmount
                    });
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return Json(new { success = false, message = $"Lỗi khi nạp tiền: {ex.Message}" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        [HttpGet("GetDeposits/{goalId}")]
        public IActionResult GetDeposits(int goalId)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập lại." });
            }

            try
            {
                var goalExists = _context.Goals
                    .Any(g => g.GoalId == goalId && g.UserId == userId);

                if (!goalExists)
                {
                    return Json(new { success = false, message = "Không tìm thấy mục tiêu." });
                }

                var deposits = _context.GoalDeposits
                    .Include(gd => gd.Wallet)
                    .AsNoTracking()
                    .Where(gd => gd.GoalId == goalId)
                    .OrderByDescending(gd => gd.DepositDate)
                    .Select(gd => new
                    {
                        depositId = gd.DepositId,
                        amount = gd.Amount,
                        walletName = gd.Wallet.WalletName,
                        note = gd.Note,
                        depositDate = gd.DepositDate
                    })
                    .ToList();

                return Json(new { success = true, data = deposits });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }
    }

    public class GoalDto
    {
        public int GoalId { get; set; }
        public string GoalName { get; set; } = "";
        public decimal TargetAmount { get; set; }
        public string Status { get; set; } = "Đang thực hiện";
    }

    public class DepositDto
    {
        public int GoalId { get; set; }
        public int WalletId { get; set; }
        public decimal Amount { get; set; }
        public string? Note { get; set; }
        public string Status { get; set; } = "Đang thực hiện"; 
    }
}
