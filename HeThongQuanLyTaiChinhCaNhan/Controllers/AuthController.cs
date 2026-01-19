using HeThongQuanLyTaiChinhCaNhan.Models;
using HeThongQuanLyTaiChinhCaNhan.Service;
using HeThongQuanLyTaiChinhCaNhan.ViewModels.MoneyMaster.ViewModels; // Đảm bảo namespace này đúng với file LoginVM của bạn
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HeThongQuanLyTaiChinhCaNhan.Controllers
{
    public class AuthController : Controller
    {
        private readonly AppDbContext context;

        public AuthController(AppDbContext context)
        {
            this.context = context;
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
                        new Claim(ClaimTypes.Name, user.FullName),
                        new Claim(ClaimTypes.Email, user.Email),
                        new Claim("UserId", user.UserId.ToString()),
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
    }
}