using HeThongQuanLyTaiChinhCaNhan.Models;
using HeThongQuanLyTaiChinhCaNhan.Service; // Đừng quên namespace này để dùng PasswordHelper
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = "Admin")]

    public class UsersController : Controller
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment; // Để lấy đường dẫn wwwroot

        public UsersController(AppDbContext context, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
        }

        // Helper method để lấy UserId
        private string? GetCurrentUserId()
        {
            return User.FindFirst("UserId")?.Value ?? 
                   User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        // ✅ FIX #1: VALIDATE IMAGE FILE
        private bool IsValidImage(IFormFile file, out string errorMessage)
        {
            errorMessage = string.Empty;

            // 1. Check file size (max 5MB)
            const long maxFileSize = 5 * 1024 * 1024;
            if (file.Length > maxFileSize)
            {
                errorMessage = "Kích thước file không được vượt quá 5MB.";
                return false;
            }

            // 2. Check MIME type
            var allowedMimeTypes = new[] { "image/jpeg", "image/jpg", "image/png" };
            if (!allowedMimeTypes.Contains(file.ContentType.ToLower()))
            {
                errorMessage = "Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG.";
                return false;
            }

            // 3. Check file extension
            var extension = Path.GetExtension(file.FileName).ToLower();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            if (!allowedExtensions.Contains(extension))
            {
                errorMessage = "File phải có đuôi .jpg, .jpeg hoặc .png.";
                return false;
            }

            // 4. Validate actual image content (prevent fake extensions)
            try
            {
                using (var stream = file.OpenReadStream())
                {
                    // Try to read image header bytes
                    var buffer = new byte[8];
                    stream.Read(buffer, 0, 8);
                    
                    // Check magic numbers for JPEG (FF D8 FF) and PNG (89 50 4E 47)
                    bool isJpeg = buffer[0] == 0xFF && buffer[1] == 0xD8 && buffer[2] == 0xFF;
                    bool isPng = buffer[0] == 0x89 && buffer[1] == 0x50 && buffer[2] == 0x4E && buffer[3] == 0x47;
                    
                    if (!isJpeg && !isPng)
                    {
                        errorMessage = "File không phải là ảnh hợp lệ.";
                        return false;
                    }
                }
            }
            catch
            {
                errorMessage = "Không thể đọc file. Vui lòng kiểm tra lại.";
                return false;
            }

            return true;
        }

        // ✅ FIX #2: VALIDATE INPUT DATA
        private bool ValidateUserInput(string email, string? fullName, string password, 
            DateOnly? dob, string role, out string errorMessage)
        {
            errorMessage = string.Empty;

            // 1. Validate Email
            if (string.IsNullOrWhiteSpace(email))
            {
                errorMessage = "Email không được để trống.";
                return false;
            }

            if (email.Length > 256)
            {
                errorMessage = "Email không được dài quá 256 ký tự.";
                return false;
            }

            // Simple email regex
            if (!System.Text.RegularExpressions.Regex.IsMatch(email, 
                @"^[\w\.-]+@[\w\.-]+\.\w+$"))
            {
                errorMessage = "Email không đúng định dạng.";
                return false;
            }

            // 2. Validate FullName
            if (!string.IsNullOrWhiteSpace(fullName) && fullName.Length > 150)
            {
                errorMessage = "Họ tên không được dài quá 150 ký tự.";
                return false;
            }

            // 3. Validate Password
            if (string.IsNullOrWhiteSpace(password))
            {
                errorMessage = "Mật khẩu không được để trống.";
                return false;
            }

            if (password.Length < 6)
            {
                errorMessage = "Mật khẩu phải có ít nhất 6 ký tự.";
                return false;
            }

            if (password.Length > 100)
            {
                errorMessage = "Mật khẩu không được dài quá 100 ký tự.";
                return false;
            }

            // 4. Validate Date of Birth
            if (dob.HasValue)
            {
                var minDate = DateOnly.FromDateTime(DateTime.Now.AddYears(-120));
                var maxDate = DateOnly.FromDateTime(DateTime.Now.AddYears(-13)); // Tối thiểu 13 tuổi

                if (dob.Value < minDate || dob.Value > maxDate)
                {
                    errorMessage = "Ngày sinh không hợp lệ. Người dùng phải từ 13 đến 120 tuổi.";
                    return false;
                }
            }

            // 5. Validate Role
            if (role != "User" && role != "Admin")
            {
                errorMessage = "Vai trò không hợp lệ. Chỉ chấp nhận 'User' hoặc 'Admin'.";
                return false;
            }

            return true;
        }

        // ✅ SANITIZE HTML TO PREVENT XSS
        private string? SanitizeHtml(string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return input;
            
            return System.Net.WebUtility.HtmlEncode(input.Trim());
        }

        // GET: Hiển thị danh sách (Filter IsDelete)
        public IActionResult Index()
        {
            var users = _context.Users
                .Where(u => u.IsDelete == false || u.IsDelete == null)
                .OrderByDescending(u => u.CreatedAt)
                .ToList();
            return View(users);
        }

        // GET: Hiển thị form thêm mới
        public IActionResult Add()
        {
            return View();
        }

        // POST: Xử lý thêm mới
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Add(string email, string fullName, string password, string address, string city, string country, DateOnly? dob, string role, int isActive, IFormFile? avatar)
        {
            try
            {
                // 1. Kiểm tra Email đã tồn tại chưa (chỉ trong các user chưa xóa)
                if (await _context.Users.AnyAsync(u => u.Email == email && (u.IsDelete == false || u.IsDelete == null)))
                {
                    return Json(new { success = false, message = "Email này đã được sử dụng!" });
                }

                // 2. Tạo User Object
                var newUser = new HeThongQuanLyTaiChinhCaNhan.Models.User
                {
                    UserId = Guid.NewGuid().ToString(), // Tự sinh ID
                    Email = email,
                    FullName = fullName,
                    PasswordHash = PasswordHelper.HashPassword(password), // Mã hóa pass
                    Address = address,
                    City = city,
                    Country = country,
                    DateOfBirth = dob,
                    Role = role,
                    IsActive = isActive == 1, // Chuyển int 1/0 sang bool
                    CreatedAt = DateTime.Now,
                    AvatarUrl = null, // Mặc định null
                    IsDelete = false // Set mặc định IsDelete = false
                };

                // 3. Xử lý Upload Ảnh (Nếu có)
                if (avatar != null && avatar.Length > 0)
                {
                    // Tạo đường dẫn: wwwroot/images/avatars
                    string uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images", "avatars");
                    if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                    // Tạo tên file độc nhất
                    string uniqueFileName = Guid.NewGuid().ToString() + "_" + avatar.FileName;
                    string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    // Lưu file
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await avatar.CopyToAsync(fileStream);
                    }

                    // Cập nhật đường dẫn vào DB
                    newUser.AvatarUrl = "/images/avatars/" + uniqueFileName;
                }

                // 4. Lưu vào DB
                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Thêm người dùng thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }
        // 1. GET: Hiển thị form Edit với dữ liệu cũ
        public async Task<IActionResult> Edit(string id)
        {
            if (string.IsNullOrEmpty(id)) return NotFound();

            var user = await _context.Users
                .Where(u => u.UserId == id && (u.IsDelete == false || u.IsDelete == null))
                .FirstOrDefaultAsync();
            
            if (user == null) return NotFound();

            return View(user);
        }

        // 2. POST: Xử lý cập nhật
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(
            string userID, // ID (readonly)
            string email,
            string fullName,
            string? password, // Có thể null nếu ko đổi pass
            string address,
            string city,
            string country,
            DateOnly? dob,
            string role,
            int isActive,
            IFormFile? avatar)
        {
            // ✅ KHÔNG CHO PHÉP SỬA CHÍNH MÌNH
            var currentUserId = GetCurrentUserId();
            if (currentUserId == userID)
            {
                return Json(new { 
                    success = false, 
                    message = "Bạn không thể sửa tài khoản đang đăng nhập! Vui lòng sử dụng trang 'Tài khoản' để chỉnh sửa thông tin cá nhân." 
                });
            }

            var user = await _context.Users.FindAsync(userID);
            if (user == null || user.IsDelete == true) 
                return Json(new { success = false, message = "Không tìm thấy user." });

            try
            {
                // A. Cập nhật thông tin cơ bản
                user.Email = email; // (Lưu ý: Nếu không cho đổi email thì bỏ dòng này)
                user.FullName = fullName;
                user.Address = address;
                user.City = city;
                user.Country = country;
                user.DateOfBirth = dob;
                user.Role = role;
                user.IsActive = isActive == 1;

                // B. Xử lý đổi mật khẩu (Chỉ cập nhật nếu có nhập)
                if (!string.IsNullOrEmpty(password))
                {
                    user.PasswordHash = PasswordHelper.HashPassword(password);
                }

                // C. Xử lý Upload Ảnh (Nếu có chọn ảnh mới)
                if (avatar != null && avatar.Length > 0)
                {
                    string uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images", "avatars");
                    if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                    string uniqueFileName = Guid.NewGuid().ToString() + "_" + avatar.FileName;
                    string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await avatar.CopyToAsync(fileStream);
                    }

                    // Xóa ảnh cũ (Optional)
                    if (!string.IsNullOrEmpty(user.AvatarUrl) && !user.AvatarUrl.Contains("ui-avatars"))
                    {
                        var oldPath = Path.Combine(_webHostEnvironment.WebRootPath, user.AvatarUrl.TrimStart('/'));
                        if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
                    }

                    user.AvatarUrl = "/images/avatars/" + uniqueFileName;
                }

                // D. Lưu DB
                _context.Update(user);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Cập nhật thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }
        // POST: /Admin/Users/Delete
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(string id)
        {
            // 1. Kiểm tra ID
            if (string.IsNullOrEmpty(id)) return Json(new { success = false, message = "ID không hợp lệ." });

            // 2. Không cho phép tự xóa chính mình
            var currentUserId = GetCurrentUserId();
            if (currentUserId == id)
            {
                return Json(new { success = false, message = "Bạn không thể xóa tài khoản đang đăng nhập!" });
            }

            // 3. Tìm User
            var user = await _context.Users.FindAsync(id);
            if (user == null || user.IsDelete == true) 
                return Json(new { success = false, message = "Người dùng không tồn tại." });

            try
            {
                // SOFT DELETE: Chỉ đánh dấu IsDelete = true thay vì xóa hẳn
                user.IsDelete = true;
                _context.Update(user);
                await _context.SaveChangesAsync();
                return Json(new { success = true, message = "Đã xóa người dùng thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }
    }
}