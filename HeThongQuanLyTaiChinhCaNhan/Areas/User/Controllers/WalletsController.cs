using HeThongQuanLyTaiChinhCaNhan.Models;
using HeThongQuanLyTaiChinhCaNhan.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.Controllers
{
    [Area("User")]
    [Route("User/Wallets")]
    [Authorize]
    public class WalletsController : Controller
    {
        private readonly AppDbContext _context;

        public WalletsController(AppDbContext context)
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
                TempData["ErrorMessage"] = "Vui lòng đăng nhập để xem ví của bạn.";
                return RedirectToAction("Login", "Auth", new { area = "" });
            }

            var currentUser = _context.Users
                .AsNoTracking()
                .FirstOrDefault(u => u.UserId == userId);
            
            if (currentUser == null)
            {
                TempData["ErrorMessage"] = "Không tìm thấy thông tin người dùng.";
                return RedirectToAction("Login", "Auth", new { area = "" });
            }

            // Load wallets với tính toán tổng số transactions
            var wallets = _context.Wallets
                .AsNoTracking()
                .Where(w => w.UserId == userId)
                .Select(w => new
                {
                    Wallet = w,
                    TransactionCount = _context.Transactions.Count(t => t.WalletId == w.WalletId)
                })
                .OrderByDescending(x => x.Wallet.CreatedAt)
                .Select(x => x.Wallet)
                .ToList();

            ViewBag.CurrentUserId = userId;
            ViewBag.CurrentUserName = currentUser.FullName;
            ViewBag.TotalWallets = wallets.Count;
            ViewBag.TotalBalance = wallets.Sum(w => w.Balance ?? 0);

            return View("Wallets", wallets);
        }

        [HttpPost("Create")]
        public IActionResult Create([FromBody] WalletDto dto)
        {
            if (dto == null)
            {
                return Json(new { success = false, message = "Dữ liệu không hợp lệ." });
            }

            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập để thêm ví." });
            }

            try
            {
                // Validate
                if (string.IsNullOrWhiteSpace(dto.WalletName))
                {
                    return Json(new { success = false, message = "Tên ví không được để trống." });
                }

                if (dto.WalletName.Length > 100)
                {
                    return Json(new { success = false, message = "Tên ví không được quá 100 ký tự." });
                }

                // Validation: Cho phép số âm cho thẻ tín dụng
                if (dto.WalletType != "Credit Card" && dto.InitialBalance < 0)
                {
                    return Json(new { success = false, message = "Số dư ban đầu không được âm (trừ thẻ tín dụng)." });
                }

                // Kiểm tra trùng tên ví (trong cùng user)
                var isDuplicate = _context.Wallets
                    .Any(w => w.UserId == userId && w.WalletName == dto.WalletName);
                
                if (isDuplicate)
                {
                    return Json(new { success = false, message = "Tên ví đã tồn tại. Vui lòng chọn tên khác." });
                }

                var wallet = new Wallet
                {
                    UserId = userId,
                    WalletName = dto.WalletName.Trim(),
                    WalletType = dto.WalletType,
                    Icon = string.IsNullOrEmpty(dto.Icon) ? "fa-wallet" : dto.Icon,
                    InitialBalance = dto.InitialBalance,
                    Balance = dto.InitialBalance,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                _context.Wallets.Add(wallet);
                _context.SaveChanges();

                return Json(new
                {
                    success = true,
                    message = "Thêm ví thành công!",
                    walletId = wallet.WalletId,
                    walletName = wallet.WalletName,
                    balance = wallet.Balance
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

            var wallet = _context.Wallets
                .AsNoTracking()
                .FirstOrDefault(w => w.WalletId == id && w.UserId == userId);

            if (wallet != null)
            {
                var dto = new
                {
                    walletId = wallet.WalletId,
                    walletName = wallet.WalletName,
                    walletType = wallet.WalletType,
                    icon = wallet.Icon,
                    initialBalance = wallet.InitialBalance,
                    balance = wallet.Balance,
                    createdAt = wallet.CreatedAt,
                    updatedAt = wallet.UpdatedAt
                };
                return Json(new { success = true, data = dto });
            }

            return Json(new { success = false, message = "Không tìm thấy ví hoặc bạn không có quyền truy cập." });
        }

        [HttpPost("Update")]
        public IActionResult Update([FromBody] WalletDto dto)
        {
            if (dto == null || dto.WalletId <= 0)
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
                var existing = _context.Wallets
                    .FirstOrDefault(w => w.WalletId == dto.WalletId && w.UserId == userId);

                if (existing == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy ví hoặc bạn không có quyền sửa." });
                }

                // Validate
                if (string.IsNullOrWhiteSpace(dto.WalletName))
                {
                    return Json(new { success = false, message = "Tên ví không được để trống." });
                }

                if (dto.WalletName.Length > 100)
                {
                    return Json(new { success = false, message = "Tên ví không được quá 100 ký tự." });
                }

                // Kiểm tra trùng tên (trừ chính nó)
                var isDuplicate = _context.Wallets
                    .Any(w => w.UserId == userId && 
                              w.WalletName == dto.WalletName && 
                              w.WalletId != dto.WalletId);
                
                if (isDuplicate)
                {
                    return Json(new { success = false, message = "Tên ví đã tồn tại. Vui lòng chọn tên khác." });
                }

                // Cập nhật thông tin
                existing.WalletName = dto.WalletName.Trim();
                existing.WalletType = dto.WalletType;
                existing.Icon = string.IsNullOrEmpty(dto.Icon) ? "fa-wallet" : dto.Icon;
                existing.InitialBalance = dto.InitialBalance;
                existing.UpdatedAt = DateTime.Now;

                // Tính lại Balance dựa trên InitialBalance và transactions
                var transactionSum = _context.Transactions
                    .Where(t => t.WalletId == dto.WalletId)
                    .AsNoTracking()
                    .Select(t => t.Type == "Income" ? t.Amount : -t.Amount)
                    .Sum();

                existing.Balance = dto.InitialBalance + transactionSum;

                _context.SaveChanges();

                return Json(new
                {
                    success = true,
                    message = "Cập nhật ví thành công!",
                    newBalance = existing.Balance
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
                var wallet = _context.Wallets
                    .FirstOrDefault(w => w.WalletId == id && w.UserId == userId);

                if (wallet == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy ví hoặc bạn không có quyền xóa." });
                }

                // Kiểm tra có transactions không
                var transactionCount = _context.Transactions
                    .Count(t => t.WalletId == id);

                if (transactionCount > 0)
                {
                    return Json(new
                    {
                        success = false,
                        message = $"Không thể xóa ví này vì đang có {transactionCount} giao dịch liên quan. Vui lòng xóa các giao dịch trước."
                    });
                }

                // Kiểm tra có goal deposits không
                var hasGoalDeposits = _context.GoalDeposits
                    .Any(gd => gd.WalletId == id);

                if (hasGoalDeposits)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Không thể xóa ví này vì đang có các khoản gửi mục tiêu liên quan."
                    });
                }

                _context.Wallets.Remove(wallet);
                _context.SaveChanges();

                return Json(new { success = true, message = "Đã xóa ví thành công." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        /// <summary>
        /// Tính lại số dư ví dựa trên InitialBalance và tất cả transactions
        /// </summary>
        [HttpPost("RecalculateBalance/{id}")]
        public IActionResult RecalculateBalance(int id)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập lại." });
            }

            try
            {
                var wallet = _context.Wallets
                    .FirstOrDefault(w => w.WalletId == id && w.UserId == userId);

                if (wallet == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy ví hoặc bạn không có quyền truy cập." });
                }

                // Tính tổng từ transactions
                var transactionSum = _context.Transactions
                    .Where(t => t.WalletId == id)
                    .AsNoTracking()
                    .Select(t => t.Type == "Income" ? t.Amount : -t.Amount)
                    .Sum();

                var oldBalance = wallet.Balance;
                wallet.Balance = (wallet.InitialBalance ?? 0) + transactionSum;
                wallet.UpdatedAt = DateTime.Now;

                _context.SaveChanges();

                return Json(new
                {
                    success = true,
                    message = "Đã cập nhật số dư.",
                    oldBalance = oldBalance,
                    newBalance = wallet.Balance,
                    difference = wallet.Balance - oldBalance
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        /// <summary>
        /// Lấy thống kê nhanh của ví
        /// </summary>
        [HttpGet("GetStats/{id}")]
        public IActionResult GetStats(int id)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập lại." });
            }

            try
            {
                var wallet = _context.Wallets
                    .AsNoTracking()
                    .FirstOrDefault(w => w.WalletId == id && w.UserId == userId);

                if (wallet == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy ví." });
                }

                var transactions = _context.Transactions
                    .Where(t => t.WalletId == id)
                    .AsNoTracking()
                    .ToList();

                var totalIncome = transactions
                    .Where(t => t.Type == "Income")
                    .Sum(t => t.Amount);

                var totalExpense = transactions
                    .Where(t => t.Type == "Expense")
                    .Sum(t => t.Amount);

                var stats = new
                {
                    walletName = wallet.WalletName,
                    walletType = wallet.WalletType,
                    currentBalance = wallet.Balance,
                    initialBalance = wallet.InitialBalance,
                    totalTransactions = transactions.Count,
                    totalIncome = totalIncome,
                    totalExpense = totalExpense,
                    netChange = totalIncome - totalExpense
                };

                return Json(new { success = true, data = stats });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        /// <summary>
        /// Reset IDENTITY - Admin only
        /// </summary>
        [HttpGet("ResetIdentity")]
        [Authorize(Roles = "Admin")]
        public IActionResult ResetIdentity()
        {
            try
            {
                _context.ResetIdentity("Wallets");
                return Json(new
                {
                    success = true,
                    message = "IDENTITY đã được reset thành công!"
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = $"Lỗi: {ex.Message}"
                });
            }
        }

        
    }

    public class WalletDto
    {
        public int WalletId { get; set; }
        public string WalletName { get; set; } = "";
        public string WalletType { get; set; } = "Cash";
        public string? Icon { get; set; }
        public decimal InitialBalance { get; set; }
    }
}
