using System.ComponentModel.DataAnnotations;

namespace HeThongQuanLyTaiChinhCaNhan.Attributes
{
    public class MinimumAgeAttribute : ValidationAttribute
    {
        private readonly int _minimumAge;

        public MinimumAgeAttribute(int minimumAge)
        {
            _minimumAge = minimumAge;
            // Thông báo lỗi mặc định
            ErrorMessage = $"Bạn phải ít nhất {minimumAge} tuổi.";
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            // 1. Nếu giá trị null, hãy trả về Success. 
            // Việc kiểm tra bắt buộc nhập hay không nên để Attribute [Required] lo.
            if (value == null)
            {
                return ValidationResult.Success;
            }

            if (value is DateOnly dateOfBirth)
            {
                var today = DateOnly.FromDateTime(DateTime.Today);
                var age = today.Year - dateOfBirth.Year;

                if (dateOfBirth > today.AddYears(-age)) age--;

                if (age >= _minimumAge)
                {
                    return ValidationResult.Success;
                }
            }
            // Nếu không phải DateOnly hoặc không đủ tuổi
            return new ValidationResult(ErrorMessage);
        }
    }
}