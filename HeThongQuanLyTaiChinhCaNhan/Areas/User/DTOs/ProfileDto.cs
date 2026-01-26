namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.DTOs
{
    public class UpdateProfileDto
    {
        public string? FullName { get; set; }
        public string? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
    }

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }

    public class UserProfileDto
    {
        public string UserId { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? DateOfBirth { get; set; }
        public string? Role { get; set; }
        public string? LastLogin { get; set; }
        public string? CreatedAt { get; set; }
    }
}
