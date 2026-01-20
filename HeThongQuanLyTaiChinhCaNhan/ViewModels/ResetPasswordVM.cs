using System.ComponentModel.DataAnnotations;

namespace HeThongQuanLyTaiChinhCaNhan.ViewModels
{
    public class ResetPasswordVM
    {
        [Required]
        public string Token { get; set; } // Token để đối chiếu với Cache

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu mới")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải từ 6 ký tự")]
        public string NewPassword { get; set; }

        [Required(ErrorMessage = "Vui lòng xác nhận mật khẩu")]
        [Compare("NewPassword", ErrorMessage = "Mật khẩu xác nhận không khớp")]
        public string ConfirmPassword { get; set; }
    }
}