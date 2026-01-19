using HeThongQuanLyTaiChinhCaNhan.Models;
using HeThongQuanLyTaiChinhCaNhan.Service; // Namespace chứa PasswordHelper
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = "Admin")]

    public class AccountController : Controller
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment; // Để lấy đường dẫn lưu ảnh

        public AccountController(AppDbContext context, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
        }

        // 1. GET: Hiển thị Profile
        public IActionResult Index()
        {
            var userId = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(userId)) return Redirect("/Auth/Login");

            var user = _context.Users.Find(userId);
            if (user == null) return NotFound();

            return View(user);
        }

        // 2. POST: Cập nhật Profile & Avatar
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateProfile(string fullName, DateOnly? dob, string address, string city, IFormFile? avatar)
        {
            var userId = User.FindFirst("UserId")?.Value;
            var user = await _context.Users.FindAsync(userId);

            if (user == null) return Json(new { success = false, message = "Không tìm thấy tài khoản." });

            try
            {
                // A. XỬ LÝ UPLOAD ẢNH (Nếu có chọn ảnh mới)
                if (avatar != null && avatar.Length > 0)
                {
                    // 1. Tạo đường dẫn thư mục lưu: wwwroot/images/avatars
                    string uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images", "avatars");

                    // Tạo thư mục nếu chưa có
                    if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                    // 2. Tạo tên file độc nhất (dùng GUID) để tránh trùng
                    string uniqueFileName = Guid.NewGuid().ToString() + "_" + avatar.FileName;
                    string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    // 3. Lưu file mới vào server
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await avatar.CopyToAsync(fileStream);
                    }

                    // 4. XOÁ ẢNH CŨ (Nếu có và không phải ảnh mặc định ui-avatars)
                    if (!string.IsNullOrEmpty(user.AvatarUrl) && !user.AvatarUrl.Contains("ui-avatars.com"))
                    {
                        // user.AvatarUrl đang dạng: /images/avatars/abc.jpg
                        // Cần chuyển thành đường dẫn vật lý
                        string oldFilePath = Path.Combine(_webHostEnvironment.WebRootPath, user.AvatarUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

                        if (System.IO.File.Exists(oldFilePath))
                        {
                            System.IO.File.Delete(oldFilePath);
                        }
                    }

                    // 5. Cập nhật đường dẫn mới vào DB
                    user.AvatarUrl = "/images/avatars/" + uniqueFileName;
                }

                // B. CẬP NHẬT THÔNG TIN CƠ BẢN
                user.FullName = fullName;
                user.DateOfBirth = dob;
                user.Address = address;
                user.City = city;

                _context.Update(user);
                await _context.SaveChangesAsync();

                // Trả về Avatar mới (nếu có) để JS cập nhật giao diện
                return Json(new { success = true, message = "Cập nhật thành công!", newAvatar = user.AvatarUrl });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // 3. POST: Đổi mật khẩu (Dùng PasswordHelper)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ChangePassword(string currentPass, string newPass)
        {
            var userId = User.FindFirst("UserId")?.Value;
            var user = await _context.Users.FindAsync(userId);

            if (user == null) return Json(new { success = false, message = "Lỗi xác thực." });

            // 1. Hash mật khẩu người dùng nhập vào để so sánh
            string currentPassHash = PasswordHelper.HashPassword(currentPass);

            if (user.PasswordHash != currentPassHash)
            {
                return Json(new { success = false, message = "Mật khẩu hiện tại không đúng." });
            }

            try
            {
                // 2. Hash mật khẩu mới và lưu
                user.PasswordHash = PasswordHelper.HashPassword(newPass);

                _context.Update(user);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Đổi mật khẩu thành công!" });
            }
            catch (Exception)
            {
                return Json(new { success = false, message = "Lỗi hệ thống." });
            }
        }
    }
}