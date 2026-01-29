using HeThongQuanLyTaiChinhCaNhan.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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

        // Helper method để lấy UserId
        private string? GetCurrentUserId()
        {
            return User.FindFirst("UserId")?.Value ?? 
                   User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        // 1. Hiển thị danh sách Ticket (chỉ hiển thị chưa xóa)
        public IActionResult Index()
        {
            var tickets = _context.Tickets
                .Include(t => t.User) // Kèm thông tin User để lấy Tên/Avatar
                .Where(t => t.IsDelete == false || t.IsDelete == null) // Filter IsDelete
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
            
            // Kiểm tra ticket chưa bị xóa
            if (ticket == null || ticket.IsDelete == true)
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
                var adminId = GetCurrentUserId();
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

        // 3. Xóa ticket (Soft delete)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            
            if (ticket == null || ticket.IsDelete == true)
                return Json(new { success = false, message = "Ticket không tồn tại." });

            try
            {
                // SOFT DELETE
                ticket.IsDelete = true;
                _context.Update(ticket);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Đã xóa ticket thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }
    }
}