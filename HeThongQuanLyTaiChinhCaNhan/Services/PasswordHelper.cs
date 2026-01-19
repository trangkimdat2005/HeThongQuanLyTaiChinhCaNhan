using System;
using System.Collections.Generic;
using System.Text;

namespace HeThongQuanLyTaiChinhCaNhan.Service
{
    public static class PasswordHelper
    {
        public static string HashPassword(string password)
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                byte[] bytes = System.Text.Encoding.UTF8.GetBytes(password);
                byte[] hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }
    }
}
