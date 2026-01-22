using Microsoft.EntityFrameworkCore;
using System.Data;

namespace HeThongQuanLyTaiChinhCaNhan.Services
{
    public static class DatabaseHelper
    {
        /// <summary>
        /// Reset IDENTITY của bảng về số ID cao nhất hiện có
        /// </summary>
        /// <param name="context">DbContext</param>
        /// <param name="tableName">Tên bảng (vd: "Transactions")</param>
        public static void ResetIdentity(this DbContext context, string tableName)
        {
            try
            {
                // Lấy ID cao nhất hiện tại
                var maxIdQuery = $"SELECT ISNULL(MAX({tableName}Id), 0) FROM {tableName}";
                var maxId = context.Database.SqlQueryRaw<int>(maxIdQuery).AsEnumerable().FirstOrDefault();

                // Nếu bảng rỗng (maxId = 0), reset về 0 để ID tiếp theo là 1
                // Nếu có dữ liệu, reset về maxId để ID tiếp theo là maxId + 1
                var reseedQuery = $"DBCC CHECKIDENT ('{tableName}', RESEED, {maxId})";
                context.Database.ExecuteSqlRaw(reseedQuery);

                Console.WriteLine($"[DatabaseHelper] IDENTITY của {tableName} đã được reset về {maxId}. ID tiếp theo: {maxId + 1}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DatabaseHelper] Lỗi khi reset IDENTITY: {ex.Message}");
            }
        }

        /// <summary>
        /// Reset IDENTITY của bảng Transactions
        /// </summary>
        public static void ResetTransactionIdentity(this DbContext context)
        {
            context.ResetIdentity("Transactions");
        }

        /// <summary>
        /// Reset IDENTITY về 0 (bắt đầu lại từ 1) - chỉ dùng khi muốn clear hết
        /// </summary>
        public static void ResetIdentityToZero(this DbContext context, string tableName)
        {
            try
            {
                var reseedQuery = $"DBCC CHECKIDENT ('{tableName}', RESEED, 0)";
                context.Database.ExecuteSqlRaw(reseedQuery);
                Console.WriteLine($"[DatabaseHelper] IDENTITY của {tableName} đã được reset về 0. ID tiếp theo: 1");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DatabaseHelper] Lỗi: {ex.Message}");
            }
        }
    }
}
