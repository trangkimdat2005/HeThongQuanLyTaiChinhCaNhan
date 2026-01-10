using System;
using System.Collections.Generic;
using System.Text;

namespace HeThongQuanLyTaiChinhCaNhan.Service
{
    public static class ImageHelper
    {

        public static byte[] ConvertImageToByteArray(string filePath)
        {

            try
            {
                if (File.Exists(filePath))
                {
                    return File.ReadAllBytes(filePath);
                }
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while converting image to byte array: {ex.Message}");
                return null;
            }
        }

        public static string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName)?.ToLowerInvariant();

            switch (extension)
            {
                case ".jpg":
                case ".jpeg":
                    return "image/jpeg";
                case ".png":
                    return "image/png";
                case ".gif":
                    return "image/gif";
                case ".bmp":
                    return "image/bmp";
                case ".svg":
                    return "image/svg+xml";
                default:
                    return "application/octet-stream";
            }
        }

        public static string ConvertToBase64Image(byte[] bytes, string fileName)
        {
            if (bytes == null || bytes.Length == 0)
                return null;

            string contentType = GetContentType(fileName);
            string base64 = Convert.ToBase64String(bytes);

            return $"data:{contentType};base64,{base64}";
        }
    }
}
