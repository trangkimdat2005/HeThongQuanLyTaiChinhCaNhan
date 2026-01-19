using HeThongQuanLyTaiChinhCaNhan.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Cần thiết để dùng ToList()

namespace HeThongQuanLyTaiChinhCaNhan.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class CategoriesController : Controller
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            // Lấy danh sách danh mục từ DB
            var categories = _context.Categories.ToList();

            // Truyền sang View bằng ViewBag
            ViewBag.Categories = categories;

            return View();
        }

        public IActionResult Add()
        {
            return View();
        }
        // POST: /Admin/Categories/Add
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Add([FromBody] Category model)
        {
            // 1. Lấy UserId từ Claims (Lấy thẳng chuỗi String)
            var userId = User.FindFirst("UserId")?.Value;

            // Kiểm tra nếu chưa đăng nhập hoặc mất session
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Phiên đăng nhập hết hạn. Vui lòng F5 và đăng nhập lại." });
            }

            // 2. Gán UserId vào model (Chữ 'd' viết thường như DB của bạn)
            model.UserId = userId;

            // 3. QUAN TRỌNG: Bỏ qua kiểm tra Validation cho trường UserId
            // (Vì form bên ngoài không gửi UserId lên, nên ModelState sẽ báo lỗi Required -> Ta xóa lỗi này đi)
            ModelState.Remove("UserId");
            ModelState.Remove("User"); // Xóa luôn cái này nếu có Navigation Property

            if (ModelState.IsValid)
            {
                try
                {
                    // 4. Kiểm tra trùng tên (Trong phạm vi của User đó thôi)
                    // Lưu ý: UserId trong DB là string nên so sánh bình thường
                    bool exists = await _context.Categories.AnyAsync(c =>
                        c.CategoryName == model.CategoryName &&
                        c.Type == model.Type &&
                        c.UserId == userId);

                    if (exists)
                    {
                        return Json(new { success = false, message = "Tên danh mục này đã tồn tại!" });
                    }

                    _context.Add(model);
                    await _context.SaveChangesAsync();
                    return Json(new { success = true, message = "Thêm danh mục thành công!" });
                }
                catch (Exception ex)
                {
                    return Json(new { success = false, message = "Lỗi Database: " + ex.Message });
                }
            }

            // --- DEBUG LỖI ---
            // Nếu xuống đây nghĩa là vẫn còn lỗi Validation khác (Ví dụ: Tên để trống...)
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return Json(new { success = false, message = "Dữ liệu không hợp lệ:\n" + string.Join("\n", errors) });
        }

        // 1. GET: Hiển thị form với dữ liệu cũ
        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound(); // Hoặc chuyển hướng báo lỗi
            }
            return View(category); // Truyền model sang View để điền sẵn
        }

        // 2. POST: Cập nhật dữ liệu
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [FromBody] Category model)
        {
            // FIX LỖI NULL REFERENCE: Kiểm tra model trước
            if (model == null)
            {
                return Json(new { success = false, message = "Dữ liệu gửi lên không hợp lệ (Model is null)." });
            }

            if (id != model.CategoryId)
            {
                return Json(new { success = false, message = "ID danh mục không khớp!" });
            }

            // --- BẮT ĐẦU ĐOẠN FIX LỖI VALIDATION ---

            // 1. Lấy UserId từ phiên đăng nhập
            var userId = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Phiên đăng nhập hết hạn." });
            }

            // 2. Gán lại UserId cho model (Để không bị mất chủ sở hữu khi update)
            model.UserId = userId;

            // 3. Xóa lỗi Validation (Vì form không gửi UserId lên)
            ModelState.Remove("UserId");
            ModelState.Remove("User");

            // --- KẾT THÚC ĐOẠN FIX ---

            if (ModelState.IsValid)
            {
                try
                {
                    // Kiểm tra trùng tên (Trừ chính nó ra: c.CategoryId != id)
                    // Và phải check đúng User đó
                    bool exists = await _context.Categories.AnyAsync(c =>
                        c.CategoryName == model.CategoryName &&
                        c.Type == model.Type &&
                        c.UserId == userId &&
                        c.CategoryId != id);

                    if (exists)
                    {
                        return Json(new { success = false, message = "Tên danh mục này đã tồn tại!" });
                    }

                    _context.Update(model);
                    await _context.SaveChangesAsync();
                    return Json(new { success = true, message = "Cập nhật thành công!" });
                }
                catch (Exception ex)
                {
                    return Json(new { success = false, message = "Lỗi Database: " + ex.Message });
                }
            }

            // Debug lỗi chi tiết
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return Json(new { success = false, message = "Dữ liệu không hợp lệ:\n" + string.Join("\n", errors) });
        }
        // POST: /Admin/Categories/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            // 1. Lấy UserId hiện tại
            var userId = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Phiên đăng nhập hết hạn." });
            }

            // 2. Tìm danh mục (Phải đúng ID và đúng UserId của người đó)
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryId == id && c.UserId == userId);

            if (category == null)
            {
                return Json(new { success = false, message = "Không tìm thấy danh mục hoặc bạn không có quyền xóa." });
            }

            try
            {
                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();
                return Json(new { success = true, message = "Xóa thành công!" });
            }
            catch (Exception)
            {
                // Lỗi này thường do danh mục đã có giao dịch (Transactions) sử dụng
                return Json(new { success = false, message = "Không thể xóa! Danh mục này đang chứa các giao dịch." });
            }
        }
    }
}