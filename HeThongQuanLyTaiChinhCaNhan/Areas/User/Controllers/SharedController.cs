using HeThongQuanLyTaiChinhCaNhan.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.Controllers
{
    [Area("User")]
    [Route("User/Shared")]
    public class SharedController : Controller
    {
        private readonly AppDbContext _context;

        public SharedController(AppDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View("Shared");
        }

        [HttpGet("GetUserProfile")]
        public async Task<IActionResult> GetUserProfile()
        {
            // Lấy UserId từ Claims của người dùng đã đăng nhập
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var user = await _context.Users.FindAsync(userId);

            if (user == null) return NotFound();

            // Trả về dữ liệu (nên dùng DTO để tránh lộ PasswordHash)
            return Json(new
            {
                success = true,
                data = new
                {
                    fullName = user.FullName,
                    avatarUrl = user.AvatarUrl ?? $"https://ui-avatars.com/api/?name={user.FullName}&background=4e73df&color=fff",
                    email = user.Email,
                    dob = user.DateOfBirth?.ToString("yyyy-MM-dd"), // Format để input date hiểu được
                    address = user.Address,
                    city = user.City,
                    country = user.Country
                }
            });
        }
    }
}
