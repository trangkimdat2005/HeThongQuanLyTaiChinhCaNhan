using System.Security.Claims;

namespace HeThongQuanLyTaiChinhCaNhan.Extensions
{
    public static class ClaimsExtensions
    {
        // Đổi kiểu trả về từ int sang string
        public static string GetCurrentUserId(this ClaimsPrincipal user)
        {
            // Lấy value từ claim "UserId" hoặc "id" tùy cấu hình của bạn
            // ?.Value sẽ trả về null nếu không tìm thấy
            return user.FindFirst("UserId")?.Value ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}
