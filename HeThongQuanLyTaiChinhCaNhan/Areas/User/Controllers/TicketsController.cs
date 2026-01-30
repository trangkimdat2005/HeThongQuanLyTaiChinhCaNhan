using HeThongQuanLyTaiChinhCaNhan.Areas.User.DTOs;
using HeThongQuanLyTaiChinhCaNhan.Extensions;
using HeThongQuanLyTaiChinhCaNhan.Models;
using HeThongQuanLyTaiChinhCaNhan.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.Controllers
{
    [Area("User")]
    [Route("User/Tickets")]
    public class TicketsController : Controller
    {

        private readonly IBaseService _baseService;

        public TicketsController(IBaseService baseService)
        {
            _baseService = baseService;
        }

        public IActionResult Index()
        {
            return View("Tickets");
        }


        [HttpGet("GetAll")]
            public IActionResult GetAll()
            {
                try
                {
                    // 1. Lấy UserId dạng chuỗi (Varchar)
                    string userId = User.GetCurrentUserId();

                    // Kiểm tra nếu không có userId (chưa đăng nhập hoặc lỗi token)
                    if (string.IsNullOrEmpty(userId))
                    {
                        return Unauthorized("Không tìm thấy thông tin User.");
                    }

                    // 2. Truyền điều kiện lọc: so sánh chuỗi (String Comparison)
                    // Entity Framework sẽ dịch cái này thành SQL: WHERE UserId = 'ABC-XYZ'
                    var tickets = _baseService.GetList<Ticket>(c => c.UserId == userId);

                    // 3. Map sang DTO
                    var result = tickets.Select(item => new TicketDto
                    {
                        TicketId = item.TicketId,
                        UserId = item.UserId,
                        QuestionType = item.QuestionType,
                        RespondType = item.RespondType,
                        Description = item.Description,
                        Status = item.Status,
                        CreatedAt = item.CreatedAt,
                        AdminResponse = item.AdminResponse,
                        RepliedBy = item.RepliedBy,
                        RepliedAt = item.RepliedAt,
                        IsDelete = item.IsDelete,
                    }).ToList();

                    return Ok(result);
                }
                catch (Exception ex)
                {
                    return StatusCode(500, "Internal server error: " + ex.Message);
                }
            }


        [HttpPost("Create")]
        public IActionResult Create([FromBody] TicketDto ticket)
        {
            try
            {
                // 1. Lấy UserId từ token
                string userId = User.GetCurrentUserId();

                // 2. Kiểm tra xác thực
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("Không tìm thấy thông tin User.");
                }

                if (ticket == null)
                {
                    return BadRequest("Dữ liệu không hợp lệ.");
                }

                // 3. Khởi tạo đối tượng Ticket
                var newTicket = new Ticket
                {
                    // QUAN TRỌNG: Sử dụng userId lấy từ Token, không lấy từ DTO
                    UserId = userId,

                    QuestionType = ticket.QuestionType,
                    RespondType = ticket.RespondType,
                    Description = ticket.Description,

                    // Các giá trị mặc định hệ thống
                    Status = "Open",
                    CreatedAt = DateTime.UtcNow, // Nên dùng UTC để đồng bộ
                    IsDelete = false
                };

                // 4. Lưu vào Database
                // Lưu ý: Hàm Add cần trả về đối tượng vừa tạo hoặc bạn cần lấy ID sau khi SaveChanges
                _baseService.Add(newTicket);
                // Giả sử sau khi Add, newTicket sẽ tự cập nhật Id (Entity Framework thường làm vậy)

                // 5. Trả về kết quả bao gồm cả TicketId để Frontend hiển thị
                return Ok(new
                {
                    Message = "Tạo yêu cầu thành công",
                    newTicket.TicketId // Trả về ID để hiện thông báo
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi server: " + ex.Message);
            }
        }
    }
}
