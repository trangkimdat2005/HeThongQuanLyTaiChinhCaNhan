namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.DTOs
{
    public class CategoryDto
    {
        public int CategoryId { get; set; }

        public string UserId { get; set; } = null!;

        public string CategoryName { get; set; } = null!;

        public string Type { get; set; } = null!;

        public string? Icon { get; set; }

        public string? Color { get; set; }

        public DateTime? CreatedAt { get; set; }
    }
}
