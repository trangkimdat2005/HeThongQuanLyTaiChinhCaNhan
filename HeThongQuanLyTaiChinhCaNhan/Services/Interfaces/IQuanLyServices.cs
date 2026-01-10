using System.Collections.Generic;

namespace HeThongQuanLyTaiChinhCaNhan.Service.Interfaces
{
    public interface IQuanLyServices
    {
        List<T> GetList<T>() where T : class;

        T GetById<T>(params object[] keyValues) where T : class;

        bool Add<T>(T entity) where T : class;

        bool Update<T>(T entity) where T : class;

        bool HardDelete<T>(T entity) where T : class;

        bool SoftDelete<T>(T entity) where T : class;

        string GenerateNewId<T>(string prefix, int totalLength) where T : class;

        byte[] ConvertImageToByteArray(string filePath);

        string ConvertToBase64Image(byte[] bytes, string fileName);

        string HashPassword(string password);
    }
}
