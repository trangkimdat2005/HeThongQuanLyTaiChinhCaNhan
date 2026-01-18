using System.ComponentModel.DataAnnotations;

namespace HeThongQuanLyTaiChinhCaNhan.ViewModels
{

    namespace MoneyMaster.ViewModels
    {
        public class LoginVM
        {
            [Display(Name = "Địa chỉ Email")]
            [Required(ErrorMessage = "Vui lòng nhập Email")] // Bắt buộc nhập
            [EmailAddress(ErrorMessage = "Định dạng Email không hợp lệ")] // Kiểm tra phải là a@b.c
            public string Email { get; set; }

            [Display(Name = "Mật khẩu")]
            [Required(ErrorMessage = "Vui lòng nhập mật khẩu")]
            [DataType(DataType.Password)] // Giúp trình duyệt hiểu đây là field mật khẩu (ẩn ký tự)
            public string Password { get; set; }
        }
    }
}
