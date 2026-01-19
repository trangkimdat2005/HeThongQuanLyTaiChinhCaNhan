using HeThongQuanLyTaiChinhCaNhan.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = "Admin")]

    public class SupportController : Controller
    {
        private readonly AppDbContext _context;

        public SupportController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Hiển thị danh sách Ticket
        public IActionResult Index()
        {
            var tickets = _context.Tickets
                .Include(t => t.User) // Kèm thông tin User để lấy Tên/Avatar
                .OrderByDescending(t => t.CreatedAt) // Mới nhất lên đầu
                .ToList();

            return View(tickets);
        }

        // 2. Xử lý phản hồi (AJAX gọi vào đây)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Reply(int id, string adminResponse, string status)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null)
            {
                return Json(new { success = false, message = "Không tìm thấy yêu cầu này." });
            }

            try
            {
                // Cập nhật thông tin
                ticket.AdminResponse = adminResponse;
                ticket.Status = status; // Cập nhật trạng thái (Resolved/Pending...)
                ticket.RepliedAt = DateTime.Now;

                // Lưu người trả lời (Admin đang đăng nhập)
                var adminId = User.FindFirst("UserId")?.Value;
                if (!string.IsNullOrEmpty(adminId)) ticket.RepliedBy = adminId;

                _context.Update(ticket);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Đã gửi phản hồi thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }
    }
}