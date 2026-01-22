using HeThongQuanLyTaiChinhCaNhan.Models;
using HeThongQuanLyTaiChinhCaNhan.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.Controllers
{
    [Area("User")]
    [Route("User/Transactions")]
    [Authorize] 
    public class TransactionsController : Controller
    {
        private readonly AppDbContext _context;

        public TransactionsController(AppDbContext context)
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
        public IActionResult Index(int? walletId, string? type, string? fromDate, string? toDate)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return RedirectToAction("Login", "Auth", new { area = "" });
            }

            ViewBag.wallets = _context.Wallets
                .AsNoTracking()
                .Where(w => w.UserId == userId)
                .OrderBy(w => w.WalletName)
                .ToList();

            ViewBag.categories = _context.Categories
                .AsNoTracking()
                .Where(c => c.UserId == userId && c.IsDelete == false)
                .OrderBy(c => c.CategoryName)
                .ToList();

            var query = _context.Transactions
                .Include(t => t.Category)
                .Include(t => t.Wallet)
                .Where(t => t.UserId == userId)
                .AsQueryable();

            // Apply filters if provided
            if (walletId.HasValue && walletId.Value > 0)
            {
                query = query.Where(t => t.WalletId == walletId.Value);
            }

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(t => t.Type == type);
            }

            if (!string.IsNullOrEmpty(fromDate) && DateOnly.TryParse(fromDate, out DateOnly parsedFromDate))
            {
                query = query.Where(t => t.TransactionDate >= parsedFromDate);
            }

            if (!string.IsNullOrEmpty(toDate) && DateOnly.TryParse(toDate, out DateOnly parsedToDate))
            {
                query = query.Where(t => t.TransactionDate <= parsedToDate);
            }

            var transactions = query
                .OrderByDescending(t => t.TransactionDate)
                .ThenByDescending(t => t.TransactionId)
                .AsNoTracking() //
                .ToList();
            ViewBag.FilterWalletId = walletId;
            ViewBag.FilterType = type;
            ViewBag.FilterFromDate = fromDate;
            ViewBag.FilterToDate = toDate;

            return View("Transactions", transactions);
        }

        [HttpPost("Create")]
        public IActionResult Create([FromBody] TransactionDto dto)
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
                // Validate
                if (dto.Amount <= 0)
                {
                    return Json(new { success = false, message = "Số tiền phải lớn hơn 0." });
                }

                if (dto.CategoryId <= 0 || dto.WalletId <= 0)
                {
                    return Json(new { success = false, message = "Vui lòng chọn danh mục và ví." });
                }

                if (string.IsNullOrEmpty(dto.TransactionDate) || string.IsNullOrEmpty(dto.Type))
                {
                    return Json(new { success = false, message = "Vui lòng chọn ngày và loại giao dịch." });
                }

                // Parse ngày
                if (!DateOnly.TryParse(dto.TransactionDate, out DateOnly parsedDate))
                {
                    return Json(new { success = false, message = "Ngày giao dịch không hợp lệ." });
                }

                // ✅ Kiểm tra Category thuộc về user và CHƯA BỊ XÓA
                var category = _context.Categories
                    .AsNoTracking()
                    .FirstOrDefault(c => c.CategoryId == dto.CategoryId 
                                    && c.UserId == userId 
                                    && c.IsDelete == false);

                if (category == null)
                {
                    return Json(new { success = false, message = "Danh mục không tồn tại!" });
                }

                var wallet = _context.Wallets
                    .FirstOrDefault(w => w.WalletId == dto.WalletId && w.UserId == userId);

                if (wallet == null)
                {
                    return Json(new { success = false, message = "Ví không tồn tại hoặc không thuộc về bạn." });
                }

                if (dto.Type == "Expense")
                {
                    var currentBalance = wallet.Balance ?? 0;
                    if (currentBalance < dto.Amount)
                    {
                        return Json(new
                        {
                            success = false,
                            message = $"Số dư ví không đủ"
                        });
                    }
                }

                // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
                using var dbTransaction = _context.Database.BeginTransaction();
                try
                {
                    // Tạo Transaction mới
                    var transaction = new Transaction
                    {
                        UserId = userId,
                        Amount = dto.Amount,
                        CategoryId = dto.CategoryId,
                        WalletId = dto.WalletId,
                        TransactionDate = parsedDate,
                        Description = dto.Description ?? "",
                        Type = dto.Type,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    };

                    _context.Transactions.Add(transaction);

                    // Cập nhật số dư ví
                    if (dto.Type == "Income")
                    {
                        wallet.Balance = (wallet.Balance ?? 0) + dto.Amount;
                    }
                    else if (dto.Type == "Expense")
                    {
                        wallet.Balance = (wallet.Balance ?? 0) - dto.Amount;
                    }
                    wallet.UpdatedAt = DateTime.Now;

                    _context.SaveChanges();
                    dbTransaction.Commit();

                    return Json(new
                    {
                        success = true,
                        message = "Thêm giao dịch thành công!",
                        transactionId = transaction.TransactionId,
                        newBalance = wallet.Balance
                    });
                }
                catch (Exception ex)
                {
                    dbTransaction.Rollback();
                    return Json(new { success = false, message = $"Lỗi khi lưu: {ex.Message}" });
                }
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
                // Kiểm tra transaction có thuộc về user không
                var transaction = _context.Transactions
                    .Include(t => t.Wallet)
                    .FirstOrDefault(t => t.TransactionId == id && t.UserId == userId);

                if (transaction == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy giao dịch hoặc bạn không có quyền xóa." });
                }

                using var dbTransaction = _context.Database.BeginTransaction();
                try
                {
                    //  KHÔNG hoàn trả số dư ví - Giao dịch đã thực hiện không thể hoàn tác
                    // Chỉ xóa bản ghi transaction
                    _context.Transactions.Remove(transaction);
                    _context.SaveChanges();
                    dbTransaction.Commit();

                    return Json(new { success = true, message = "Đã xóa giao dịch." });
                }
                catch (Exception ex)
                {
                    dbTransaction.Rollback();
                    return Json(new { success = false, message = $"Lỗi khi xóa: {ex.Message}" });
                }
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

            var transaction = _context.Transactions
                .AsNoTracking()
                .FirstOrDefault(t => t.TransactionId == id && t.UserId == userId);

            if (transaction != null)
            {
                var dto = new
                {
                    transactionId = transaction.TransactionId,
                    amount = transaction.Amount,
                    categoryId = transaction.CategoryId,
                    walletId = transaction.WalletId,
                    description = transaction.Description,
                    transactionDate = transaction.TransactionDate.ToString("yyyy-MM-dd"),
                    type = transaction.Type
                };
                return Json(new { success = true, data = dto });
            }

            return Json(new { success = false, message = "Không tìm thấy giao dịch." });
        }

        [HttpPost("Update")]
        public IActionResult Update([FromBody] TransactionDto dto)
        {
            if (dto == null || dto.TransactionId <= 0)
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
                var existing = _context.Transactions
                    .Include(t => t.Wallet)
                    .FirstOrDefault(t => t.TransactionId == dto.TransactionId && t.UserId == userId);

                if (existing == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy giao dịch hoặc bạn không có quyền sửa." });
                }

                // Validate
                if (dto.Amount <= 0)
                {
                    return Json(new { success = false, message = "Số tiền phải lớn hơn 0." });
                }

                if (dto.CategoryId <= 0 || dto.WalletId <= 0)
                {
                    return Json(new { success = false, message = "Vui lòng chọn danh mục và ví." });
                }

                // ✅ Kiểm tra Category thuộc về user và CHƯA BỊ XÓA
                var categoryExists = _context.Categories
                    .Any(c => c.CategoryId == dto.CategoryId 
                         && c.UserId == userId 
                         && c.IsDelete == false);

                if (!categoryExists)
                {
                    return Json(new { success = false, message = "Danh mục không tồn tại hoặc đã bị xóa." });
                }

                var newWallet = _context.Wallets
                    .FirstOrDefault(w => w.WalletId == dto.WalletId && w.UserId == userId);

                if (newWallet == null)
                {
                    return Json(new { success = false, message = "Ví không tồn tại." });
                }

                // Parse ngày
                if (!DateOnly.TryParse(dto.TransactionDate, out DateOnly parsedDate))
                {
                    return Json(new { success = false, message = "Ngày giao dịch không hợp lệ." });
                }

                // ⚠️ LOGIC MỚI: CHỈ KIỂM TRA SỐ DƯ CHO GIAO DỊCH MỚI, KHÔNG HOÀN TRẢ
                // Nếu là khoản chi, kiểm tra số dư ví hiện tại có đủ không
                if (dto.Type == "Expense")
                {
                    var currentBalance = newWallet.Balance ?? 0;
                    if (currentBalance < dto.Amount)
                    {
                        return Json(new
                        {
                            success = false,
                            message = $"Số dư ví không đủ! Số dư hiện tại: {currentBalance:N0}đ"
                        });
                    }
                }

                using var dbTransaction = _context.Database.BeginTransaction();
                try
                {
                    // ❌ KHÔNG hoàn trả số dư cũ - Giao dịch đã thực hiện không thể hoàn tác
                    
                    // Cập nhật thông tin transaction
                    existing.Amount = dto.Amount;
                    existing.CategoryId = dto.CategoryId;
                    existing.WalletId = dto.WalletId;
                    existing.Description = dto.Description ?? "";
                    existing.TransactionDate = parsedDate;
                    existing.Type = dto.Type;
                    existing.UpdatedAt = DateTime.Now;

                    // ✅ CHỈ TRỪ/CỘNG SỐ DƯ MỚI (không hoàn trả cũ)
                    if (dto.Type == "Income")
                    {
                        newWallet.Balance = (newWallet.Balance ?? 0) + dto.Amount;
                    }
                    else if (dto.Type == "Expense")
                    {
                        newWallet.Balance = (newWallet.Balance ?? 0) - dto.Amount;
                    }
                    newWallet.UpdatedAt = DateTime.Now;

                    _context.SaveChanges();
                    dbTransaction.Commit();

                    return Json(new { 
                        success = true, 
                        message = "Cập nhật giao dịch thành công! Số dư ví đã được điều chỉnh theo giao dịch mới." 
                    });
                }
                catch (Exception ex)
                {
                    dbTransaction.Rollback();
                    return Json(new { success = false, message = $"Lỗi khi cập nhật: {ex.Message}" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        [HttpGet("GetCategoriesByType")]
        public IActionResult GetCategoriesByType(string type)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new List<object>());
            }

            // ✅ Chỉ trả về categories chưa bị xóa
            var categories = _context.Categories
                .AsNoTracking()
                .Where(c => c.Type == type 
                       && c.UserId == userId 
                       && c.IsDelete == false)
                .Select(c => new { c.CategoryId, c.CategoryName })
                .OrderBy(c => c.CategoryName)
                .ToList();

            return Json(categories);
        }

        /// <summary>
        /// API lấy số dư ví hiện tại
        /// </summary>
        [HttpGet("GetWalletBalance/{walletId}")]
        public IActionResult GetWalletBalance(int walletId)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập lại." });
            }

            var wallet = _context.Wallets
                .AsNoTracking()
                .FirstOrDefault(w => w.WalletId == walletId && w.UserId == userId);

            if (wallet == null)
            {
                return Json(new { success = false, message = "Ví không tồn tại." });
            }

            return Json(new
            {
                success = true,
                walletId = wallet.WalletId,
                walletName = wallet.WalletName,
                balance = wallet.Balance ?? 0
            });
        }

        /// <summary>
        /// API để reset IDENTITY của bảng Transactions (Admin only)
        /// </summary>
        [HttpGet("ResetIdentity")]
        [Authorize(Roles = "Admin")] // Chỉ Admin mới được gọi
        public IActionResult ResetIdentity()
        {
            try
            {
                _context.ResetTransactionIdentity();
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

    // DTO class để binding data từ JSON request
    public class TransactionDto
    {
        public int TransactionId { get; set; }
        public decimal Amount { get; set; }
        public int CategoryId { get; set; }
        public int WalletId { get; set; }
        public string TransactionDate { get; set; } = "";
        public string Type { get; set; } = "";
        public string? Description { get; set; }
    }
}