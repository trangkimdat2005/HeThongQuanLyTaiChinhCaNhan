using HeThongQuanLyTaiChinhCaNhan.Models;
using HeThongQuanLyTaiChinhCaNhan.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace HeThongQuanLyTaiChinhCaNhan.Services
{
    public class BaseService : IBaseService
    {
        protected readonly AppDbContext context;

        public BaseService(AppDbContext context)
        {
            this.context = context;
        }

        public List<T> GetList<T>(Expression<Func<T, bool>> predicate = null) where T : class
        {
            try
            {
                // 1. Khởi tạo Query (Chưa chạy xuống DB)
                var query = context.Set<T>().AsNoTracking();

                // 2. Tự động thêm điều kiện "isDelete == false" nếu bảng có cột này
                // Mục đích: Chuyển logic check isDelete thành câu SQL WHERE
                var entityType = typeof(T);
                var isDeleteProperty = entityType.GetProperty("isDelete") ?? entityType.GetProperty("IsDelete");

                if (isDeleteProperty != null && isDeleteProperty.PropertyType == typeof(bool))
                {
                    // Tạo Expression Tree: e => e.isDelete == false
                    var parameter = Expression.Parameter(entityType, "e");
                    var propertyAccess = Expression.Property(parameter, isDeleteProperty);
                    var falseConstant = Expression.Constant(false);
                    var condition = Expression.Equal(propertyAccess, falseConstant);
                    var lambda = Expression.Lambda<Func<T, bool>>(condition, parameter);

                    // Áp dụng vào query
                    query = query.Where(lambda);
                }

                // 3. Áp dụng điều kiện lọc từ bên ngoài (Ví dụ: UserId == 1)
                if (predicate != null)
                {
                    query = query.Where(predicate);
                }

                // 4. Lúc này mới thực thi SQL và lấy dữ liệu về
                return query.ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi lấy danh sách {typeof(T).Name}: {ex.Message}");
                return new List<T>();
            }
        }

        public T GetById<T>(params object[] keyValues) where T : class
        {
            try
            {
                var entity = context.Set<T>().Find(keyValues);
                if (entity == null)
                {
                    throw new Exception($"Không tìm thấy đối tượng {typeof(T).Name} với Id: {string.Join(",", keyValues)}");
                }

                var property = typeof(T).GetProperty("isDelete");
                if (property != null)
                {
                    var value = property.GetValue(entity);
                    if (value is bool isDelete && isDelete)
                    {
                        throw new Exception($"Đối tượng {typeof(T).Name} với Id: {string.Join(",", keyValues)} đã bị xóa mềm (isDelete = true)");
                    }
                }
                return entity;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while retrieving entity of type {typeof(T).Name} with ID {string.Join(",", keyValues)}: {ex.Message}");
                return null;
            }
        }


        public bool Add<T>(T entity) where T : class
        {
            try
            {
                context.Set<T>().Add(entity);
                context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while adding entity of type {typeof(T).Name}: {ex.Message}");
                return false;
            }


        }

        public bool Update<T>(T entity) where T : class
        {
            try
            {
                var entry = context.Entry(entity);
                if (entry.State == EntityState.Detached)
                {
                    context.Set<T>().Attach(entity);
                }

                // Đánh dấu thực thể là đã thay đổi
                entry.State = EntityState.Modified;

                context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while updating entity of type {typeof(T).Name}: {ex.Message}");
                return false;
            }


        }

        public bool SoftDelete<T>(T entity) where T : class
        {

            try
            {
                var entry = context.Entry(entity);
                if (entry.State == EntityState.Detached)
                {
                    context.Set<T>().Attach(entity);
                }

                var property = typeof(T).GetProperty("isDelete");
                if (property != null && property.CanWrite)
                {
                    property.SetValue(entity, true);
                    entry.State = EntityState.Modified;
                    context.SaveChanges();
                    return true;
                }
                else
                {
                    Console.WriteLine("No 'isDelete' property found in entity.");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while soft deleting entity of type {typeof(T).Name}: {ex.Message}");
                return false;
            }


        }

        public bool HardDelete<T>(T entity) where T : class
        {
            try
            {
                var entry = context.Entry(entity);
                if (entry.State == EntityState.Detached)
                {
                    context.Set<T>().Attach(entity);
                }

                context.Set<T>().Remove(entity);
                context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while deleting entity of type {typeof(T).Name}: {ex.Message}");
                return false;
            }


        }

        public int GenerateNewId<T>() where T : class
        {
            try
            {
                // 1. Lấy metadata của Entity để tìm Key Name
                var entityType = context.Model.FindEntityType(typeof(T));
                var primaryKey = entityType?.FindPrimaryKey();

                if (primaryKey == null)
                    throw new Exception($"Bảng {typeof(T).Name} chưa định nghĩa Primary Key.");

                var keyProperty = primaryKey.Properties.FirstOrDefault();
                string keyName = keyProperty.Name;

                if (keyProperty.ClrType != typeof(int))
                {
                    throw new Exception($"Primary Key '{keyName}' của {typeof(T).Name} không phải kiểu int.");
                }

                // 2. Tạo Expression Tree: e => (int?)e.Id
                // MẸO: Ép kiểu sang int? (Nullable) để Max() không bị lỗi khi bảng trống
                var parameter = Expression.Parameter(typeof(T), "e");
                var propertyAccess = Expression.Property(parameter, keyName);

                // Thêm bước convert sang int?
                var castToNullable = Expression.Convert(propertyAccess, typeof(int?));

                var selectExpression = Expression.Lambda<Func<T, int?>>(castToNullable, parameter);

                // 3. Thực hiện truy vấn SELECT MAX(...)
                // Lúc này không cần DefaultIfEmpty nữa
                var maxId = context.Set<T>()
                                   .Select(selectExpression)
                                   .Max(); // Nếu bảng trống, nó trả về null thay vì lỗi

                // 4. Xử lý kết quả: Nếu null thì coi là 0, sau đó + 1
                return (maxId ?? 0) + 1;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi generate ID cho {typeof(T).Name}: {ex.Message}");
                throw;
            }
        }

        public byte[] ConvertImageToByteArray(string filePath)
        {
            throw new NotImplementedException();
        }

        public string ConvertToBase64Image(byte[] bytes, string fileName)
        {
            throw new NotImplementedException();
        }

        public string HashPassword(string password)
        {
            throw new NotImplementedException();
        }
    }
}
