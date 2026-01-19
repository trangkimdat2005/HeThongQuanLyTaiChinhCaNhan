using HeThongQuanLyTaiChinhCaNhan.Models;
using HeThongQuanLyTaiChinhCaNhan.Service; // Đừng quên namespace này để dùng PasswordHelper
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        // GET: Hiển thị danh sách
        public IActionResult Index()
        {
            var users = _context.Users.OrderByDescending(u => u.CreatedAt).ToList();
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
                // 1. Kiểm tra Email đã tồn tại chưa
                if (await _context.Users.AnyAsync(u => u.Email == email))
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
                    AvatarUrl = null // Mặc định null
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

            var user = await _context.Users.FindAsync(id);
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
            var user = await _context.Users.FindAsync(userID);
            if (user == null) return Json(new { success = false, message = "Không tìm thấy user." });

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
            var currentUserId = User.FindFirst("UserId")?.Value;
            if (currentUserId == id)
            {
                return Json(new { success = false, message = "Bạn không thể xóa tài khoản đang đăng nhập!" });
            }

            // 3. Tìm User
            var user = await _context.Users.FindAsync(id);
            if (user == null) return Json(new { success = false, message = "Người dùng không tồn tại." });

            try
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return Json(new { success = true, message = "Đã xóa người dùng thành công!" });
            }
            catch (DbUpdateException)
            {
                // Lỗi này xảy ra khi User đã có dữ liệu (Ví, Giao dịch...) -> SQL chặn xóa
                return Json(new
                {
                    success = false,
                    message = "Không thể xóa người dùng này vì họ đã có dữ liệu giao dịch/ví.\nHãy chọn 'Sửa' và chuyển trạng thái sang 'Locked' (Khóa) thay vì xóa."
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }
    }
}