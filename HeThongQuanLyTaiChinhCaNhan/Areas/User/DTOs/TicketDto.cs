namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.DTOs
{
    public class TicketDto
    {
        public int TicketId { get; set; }

        public string UserId { get; set; } = null!;

        public string QuestionType { get; set; } = null!;

        public string RespondType { get; set; } = null!;

        public string Description { get; set; } = null!;

        public string? Status { get; set; }

        public DateTime? CreatedAt { get; set; }

        public string? AdminResponse { get; set; }

        public string? RepliedBy { get; set; }

        public DateTime? RepliedAt { get; set; }

        public bool? IsDelete { get; set; }
    }
}
