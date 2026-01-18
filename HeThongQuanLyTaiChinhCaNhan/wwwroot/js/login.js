// Hàm ẩn hiện mật khẩu
function togglePass() {
    var passInput = document.getElementById("passwordInput");
    var icon = document.getElementById("eyeIcon");
    if (passInput.type === "password") {
        passInput.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        passInput.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

// Logic hiện bảng lỗi tổng (nếu Controller trả về lỗi)
$(document).ready(function () {
    if ($(".validation-summary-errors").length > 0) {
        $("[asp-validation-summary]").show();
    }
});