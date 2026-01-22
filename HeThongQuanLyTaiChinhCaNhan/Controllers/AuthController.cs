using HeThongQuanLyTaiChinhCaNhan.Models;
using HeThongQuanLyTaiChinhCaNhan.Service;
using HeThongQuanLyTaiChinhCaNhan.Services.Interfaces;
using HeThongQuanLyTaiChinhCaNhan.ViewModels.MoneyMaster.ViewModels; // Đảm bảo namespace này đúng với file LoginVM của bạn
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;

namespace HeThongQuanLyTaiChinhCaNhan.Controllers
{
    public class AuthController : Controller
    {
        private readonly AppDbContext context;

        private readonly IEmailService _emailService;
        private readonly IMemoryCache _cache; // Inject Cache

        public AuthController(AppDbContext _context, IEmailService emailService, IMemoryCache cache)
        {
            context = _context;
            _emailService = emailService;
            _cache = cache;
        }

        // GET: Hiển thị trang Login
        [HttpGet]
        public IActionResult Login()
        {
            // Nếu đã đăng nhập thì đá về trang chủ
            if (User.Identity.IsAuthenticated)
            {
                RedirectToAction("Index", "Dashboard", new { area = "Admin" });
            }
            return View();
        }

        // POST: Xử lý Login
        [HttpPost]
        public async Task<IActionResult> Login(LoginVM model)
        {
            if (ModelState.IsValid)
            {
                // 1. Mã hóa mật khẩu người dùng nhập vào để so sánh
                string hashedPassword = PasswordHelper.HashPassword(model.Password);

                // 2. Tìm user trong DB (So sánh Email và Mật khẩu ĐÃ MÃ HÓA)
                var user = await context.Users
                    .FirstOrDefaultAsync(u => u.Email == model.Email && u.PasswordHash == hashedPassword);

                if (user != null)
                {
                    // 3. Tạo danh sách thông tin (Claims)
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.NameIdentifier, user.UserId),
                        new Claim(ClaimTypes.Name, user.FullName),
                        new Claim(ClaimTypes.Email, user.Email),
                        new Claim(ClaimTypes.Role, user.Role) // Quan trọng để phân quyền
                    };

                    // 4. Tạo Identity
                    var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                    var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

                    // 5. Ghi Cookie (Đăng nhập thành công)
                    await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, claimsPrincipal);

                    // 6. Điều hướng dựa trên Role
                    if (user.Role == "Admin")
                    {
                        return RedirectToAction("Index", "Dashboard", new { area = "Admin" });
                    }
                    else
                    {
                        return RedirectToAction("Index", "Dashboard", new { area = "User" });
                    }
                }

                // Nếu không tìm thấy user hoặc sai mật khẩu
                ModelState.AddModelError("", "Email hoặc Mật khẩu không đúng!");
            }

            // Nếu form lỗi thì trả về view kèm thông báo
            return View(model);
        }

        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Index", "Home", new { area = "" });
        }
        // 1. XỬ LÝ YÊU CẦU QUÊN MẬT KHẨU (POST)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ForgotPassword(string email)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);

            // LOGIC BẢO MẬT: Dù email có hay không, vẫn báo thành công để tránh dò user
            if (user != null)
            {
                // Tạo Token định danh
                string token = Guid.NewGuid().ToString();

                // Lưu vào Cache: Key=Token -> Value=Email (Sống trong 15 phút)
                _cache.Set(token, email, TimeSpan.FromMinutes(15));

                // Tạo Link kích hoạt
                string resetLink = Url.Action("ConfirmReset", "Auth", new { token = token }, Request.Scheme);

                // Gửi Mail
                string content = $@"
                    <h3>Yêu cầu cấp lại mật khẩu</h3>
                    <p>Hệ thống nhận được yêu cầu từ tài khoản: {email}</p>
                    <p>Vui lòng nhấn vào link bên dưới để nhận mật khẩu mới (Link chỉ có hiệu lực 1 lần trong 15 phút):</p>
                    <p><a href='{resetLink}' style='background-color:#4e73df;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;'>Lấy mật khẩu mới</a></p>";

                try { await _emailService.SendEmailAsync(email, "Xác nhận cấp lại mật khẩu", content); }
                catch { /* Log lỗi */ }
            }

            TempData["ForgotPasswordSuccess"] = "Hệ thống đã gửi hướng dẫn vào email của bạn.";
            return RedirectToAction("Login");
        }

        // 2. XỬ LÝ KHI BẤM LINK TRONG EMAIL (GET)
        [HttpGet]
        public async Task<IActionResult> ConfirmReset(string token)
        {
            // Kiểm tra Token trong Cache
            if (!_cache.TryGetValue(token, out string email))
            {
                TempData["ErrorMessage"] = "Liên kết không hợp lệ hoặc đã hết hạn (chỉ dùng được 1 lần).";
                return RedirectToAction("Login");
            }

            // Tìm User
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return RedirectToAction("Login");

            // --- SINH MẬT KHẨU MỚI ---
            string newRandomPassword = PasswordHelper.GenerateRandomPassword(8); // Sinh chuỗi ngẫu nhiên 8 ký tự

            // Cập nhật DB
            user.PasswordHash = PasswordHelper.HashPassword(newRandomPassword);
            context.Users.Update(user);
            await context.SaveChangesAsync();

            // --- QUAN TRỌNG: XÓA TOKEN KHỎI CACHE NGAY ---
            // Để link này không thể dùng lại lần 2
            _cache.Remove(token);

            // Trả về View hiển thị mật khẩu mới cho người dùng copy
            ViewBag.NewPassword = newRandomPassword;
            return View();
        }
        // --- CẬP NHẬT AUTH CONTROLLER ---
        [HttpPost]
        [ValidateAntiForgeryToken] // Bước 1: Nhận thông tin, gửi OTP
        public async Task<IActionResult> RegisterStep1(RegisterVM model)
        {
            if (!ModelState.IsValid) return Json(new { success = false, message = "Dữ liệu không hợp lệ" });

            // 1. Check Email trùng trong DB
            if (await context.Users.AnyAsync(u => u.Email == model.Email))
            {
                return Json(new { success = false, message = "Email này đã được sử dụng." });
            }

            // 2. Tạo OTP ngẫu nhiên (6 số)
            string otp = new Random().Next(100000, 999999).ToString();

            // 3. Chuẩn bị dữ liệu tạm (Hash pass luôn cho an toàn)
            var tempData = new TempRegisterData
            {
                FullName = model.FullName,
                Email = model.Email,
                HashedPassword = PasswordHelper.HashPassword(model.Password),
                OtpCode = otp
            };

            // 4. Lưu vào Cache (Sống 5 phút)
            // Key là "REG_" + Email để tránh trùng với các key khác
            _cache.Set("REG_" + model.Email, tempData, TimeSpan.FromMinutes(5));

            // 5. Gửi Email
            string content = $@"
        <h3>Mã xác thực đăng ký (OTP)</h3>
        <p>Xin chào {model.FullName},</p>
        <p>Mã OTP của bạn là: <b style='font-size:20px;color:red'>{otp}</b></p>
        <p>Mã này sẽ hết hạn sau 5 phút.</p>";

            try
            {
                await _emailService.SendEmailAsync(model.Email, "Xác thực đăng ký MoneyMaster", content);
                return Json(new { success = true, message = "Đã gửi OTP" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi gửi mail: " + ex.Message });
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken] // Bước 2: Xác thực OTP và Tạo User
        public async Task<IActionResult> RegisterStep2(VerifyOtpVM model)
        {
            // 1. Lấy dữ liệu từ Cache
            if (!_cache.TryGetValue("REG_" + model.Email, out TempRegisterData tempData))
            {
                return Json(new { success = false, message = "Mã OTP đã hết hạn hoặc email không đúng. Vui lòng đăng ký lại." });
            }

            // 2. So sánh OTP
            if (tempData.OtpCode != model.OtpCode)
            {
                return Json(new { success = false, message = "Mã OTP không chính xác." });
            }

            // 3. Tạo User và Lưu xuống Database
            var newUser = new User
            {
                UserId = Guid.NewGuid().ToString(),
                Email = tempData.Email,
                FullName = tempData.FullName,
                PasswordHash = tempData.HashedPassword,
                Role = "User",
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            context.Users.Add(newUser);
            await context.SaveChangesAsync();

            // 4. Xóa Cache (OTP chỉ dùng 1 lần)
            _cache.Remove("REG_" + model.Email);

            return Json(new { success = true, message = "Đăng ký thành công!" });
        }
    }
    // Thêm class này vào cuối file AuthController hoặc file riêng
    public class TempRegisterData
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string HashedPassword { get; set; }
        public string OtpCode { get; set; }
    }
}