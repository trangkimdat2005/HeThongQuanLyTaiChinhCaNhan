using HeThongQuanLyTaiChinhCaNhan.Models;
using HeThongQuanLyTaiChinhCaNhan.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.Controllers
{
    [Area("User")]
    [Route("User/Profile")]
    [Authorize(Roles = "User")]
    public class ProfileController : Controller
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public ProfileController(AppDbContext context, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
        }

        public IActionResult Index()
        {
            return View("Profile");
        }

        // API: Lấy thông tin profile của user hiện tại
        [HttpGet("GetProfile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Không tìm thấy thông tin đăng nhập" });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return Json(new { success = false, message = "Không tìm thấy người dùng" });
            }

            var userInfo = new
            {
                userId = user.UserId,
                email = user.Email,
                fullName = user.FullName,
                avatarUrl = user.AvatarUrl,
                address = user.Address,
                city = user.City,
                country = user.Country,
                dateOfBirth = user.DateOfBirth?.ToString("yyyy-MM-dd"),
                role = user.Role,
                lastLogin = user.LastLogin?.ToString("dd/MM/yyyy HH:mm"),
                createdAt = user.CreatedAt?.ToString("dd/MM/yyyy")
            };

            return Json(new { success = true, data = userInfo });
        }

        // API: Cập nhật thông tin cá nhân
        [HttpPost("UpdateInfo")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateInfo(string fullName, string dob, string address, string city, string country)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return Json(new { success = false, message = "Không tìm thấy người dùng" });
            }

            try
            {
                user.FullName = fullName;
                user.Address = address;
                user.City = city;
                user.Country = country;

                if (!string.IsNullOrEmpty(dob) && DateOnly.TryParse(dob, out DateOnly parsedDob))
                {
                    var age = DateTime.Today.Year - parsedDob.Year;
                    if (parsedDob > DateOnly.FromDateTime(DateTime.Today).AddYears(-age)) age--;

                    if (age < 16)
                    {
                        return Json(new { success = false, message = "Bạn phải từ 16 tuổi trở lên" });
                    }
                    user.DateOfBirth = parsedDob;
                }

                _context.Update(user);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Cập nhật thông tin thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }

        // API: Upload avatar
        [HttpPost("UploadAvatar")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UploadAvatar(IFormFile avatar)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return Json(new { success = false, message = "Không tìm thấy người dùng" });
            }

            if (avatar == null || avatar.Length == 0)
            {
                return Json(new { success = false, message = "Vui lòng chọn file ảnh" });
            }

            try
            {
                // Tạo thư mục lưu ảnh
                string uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images", "avatars");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Tạo tên file độc nhất
                string uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(avatar.FileName);
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Lưu file mới
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await avatar.CopyToAsync(fileStream);
                }

                // Xóa ảnh cũ (nếu không phải ảnh mặc định)
                if (!string.IsNullOrEmpty(user.AvatarUrl) && !user.AvatarUrl.Contains("ui-avatars.com"))
                {
                    string oldFilePath = Path.Combine(_webHostEnvironment.WebRootPath, user.AvatarUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                // Cập nhật database
                user.AvatarUrl = "/images/avatars/" + uniqueFileName;
                _context.Update(user);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Cập nhật avatar thành công!", avatarUrl = user.AvatarUrl });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }

        // API: Đổi mật khẩu
        [HttpPost("ChangePassword")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ChangePassword(string currentPass, string newPass)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return Json(new { success = false, message = "Không tìm thấy người dùng" });
            }

            try
            {
                // Kiểm tra mật khẩu hiện tại
                string currentPassHash = PasswordHelper.HashPassword(currentPass);
                if (user.PasswordHash != currentPassHash)
                {
                    return Json(new { success = false, message = "Mật khẩu hiện tại không đúng" });
                }

                // Cập nhật mật khẩu mới
                user.PasswordHash = PasswordHelper.HashPassword(newPass);
                _context.Update(user);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Đổi mật khẩu thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }
    }
}
