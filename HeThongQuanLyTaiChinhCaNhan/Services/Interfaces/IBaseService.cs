using System.Collections.Generic;
using System.Linq.Expressions;

namespace HeThongQuanLyTaiChinhCaNhan.Services.Interfaces
{
    public interface IBaseService
    {
        List<T> GetList<T>(Expression<Func<T, bool>> predicate = null) where T : class;

        T GetById<T>(params object[] keyValues) where T : class;

        bool Add<T>(T entity) where T : class;

        bool Update<T>(T entity) where T : class;

        bool HardDelete<T>(T entity) where T : class;

        bool SoftDelete<T>(T entity) where T : class;

        int GenerateNewId<T>() where T : class;

        byte[] ConvertImageToByteArray(string filePath);

        string ConvertToBase64Image(byte[] bytes, string fileName);

        string HashPassword(string password);
    }
}
