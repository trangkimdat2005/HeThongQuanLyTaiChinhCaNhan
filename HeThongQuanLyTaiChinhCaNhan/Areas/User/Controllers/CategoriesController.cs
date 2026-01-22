using HeThongQuanLyTaiChinhCaNhan.Areas.User.DTOs;
using HeThongQuanLyTaiChinhCaNhan.Extensions;
using HeThongQuanLyTaiChinhCaNhan.Models;
using HeThongQuanLyTaiChinhCaNhan.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.Controllers
{
    [Area("User")]
    [Route("User/Categories")]
    public class CategoriesController : Controller
    {
        private readonly IBaseService _baseService;

        public CategoriesController(IBaseService baseService)
        {
            _baseService = baseService;
        }

        public IActionResult Index()
        {
            return View("Categories");
        }


        //[HttpGet("GetAll")]
        //public IActionResult GetAll()
        //{
        //    try
        //    {
        //        // Lấy danh sách từ service
        //        List<Category> categoriesFromDb = _baseService.GetList<Category>();

        //        // Chuyển đổi sang Dto bằng LINQ (nhanh và sạch hơn foreach/resize)
        //        var result = categoriesFromDb.Select(item => new CategoryDto
        //        {
        //            CategoryId = item.CategoryId,
        //            UserId = item.UserId,
        //            CategoryName = item.CategoryName,
        //            Type = item.Type,
        //            Icon = item.Icon,
        //            Color = item.Color,
        //            CreatedAt = item.CreatedAt
        //        }).ToList();

        //        return Ok(result); // Trả về 200 OK kèm dữ liệu
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, "Internal server error");
        //    }
        //}

        [HttpGet("GetAll")]
        public IActionResult GetAll()
        {
            try
            {
                // 1. Lấy UserId dạng chuỗi (Varchar)
                string userId = User.GetCurrentUserId();

                // Kiểm tra nếu không có userId (chưa đăng nhập hoặc lỗi token)
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("Không tìm thấy thông tin User.");
                }

                // 2. Truyền điều kiện lọc: so sánh chuỗi (String Comparison)
                // Entity Framework sẽ dịch cái này thành SQL: WHERE UserId = 'ABC-XYZ'
                var categoriesFromDb = _baseService.GetList<Category>(c => c.UserId == userId);

                // 3. Map sang DTO
                var result = categoriesFromDb.Select(item => new CategoryDto
                {
                    CategoryId = item.CategoryId, // Cái này vẫn là INT
                    UserId = item.UserId,         // Cái này là STRING (Varchar)
                    CategoryName = item.CategoryName,
                    Type = item.Type,
                    Icon = item.Icon,
                    Color = item.Color,
                    CreatedAt = item.CreatedAt
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("Update")]
        public IActionResult Update([FromBody] CategoryDto model)
        {
            if (model == null || model.CategoryId <= 0)
            {
                return BadRequest("Dữ liệu không hợp lệ");
            }

            try
            {
                // 1. Tìm đối tượng cũ trong DB
                var existingCategory = _baseService.GetById<Category>(model.CategoryId);
                if (existingCategory == null) return NotFound("Không tìm thấy danh mục");

                // 2. Cập nhật các thông tin mới
                existingCategory.CategoryName = model.CategoryName;
                existingCategory.Icon = model.Icon;
                existingCategory.Color = model.Color;
                existingCategory.Type = model.Type;

                // 3. Lưu vào database
                _baseService.Update(existingCategory);

                return Ok(new { success = true, message = "Cập nhật thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi server: " + ex.Message);
            }
        }

        [HttpPost("Create")]
        public IActionResult Create([FromBody] CategoryDto model)
        {
            // xử lý lưu vào DB...

            string userId = User.GetCurrentUserId();

            // Kiểm tra nếu không có userId (chưa đăng nhập hoặc lỗi token)
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Không tìm thấy thông tin User.");
            }

            if (model == null)
            {
                return BadRequest("Dữ liệu không hợp lệ");
            }

            try
            {
                var newCategory = new Category();

                newCategory.UserId = userId;
                newCategory.CategoryName = model.CategoryName;
                newCategory.Icon = model.Icon;
                newCategory.Color = model.Color;
                newCategory.Type = model.Type;

                // Lưu vào database
                _baseService.Add(newCategory);

                return Ok(new { success = true, message = "Thêm mới thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi server: " + ex.Message);
            }
        }

        [HttpDelete("{id}")] // URL sẽ dạng: /User/Categories/123
        public IActionResult Delete(int id)
        {
            // 1. Kiểm tra User
            string userId = User.GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Không tìm thấy thông tin User.");
            }

            try
            {
                // 2. Tìm bản ghi từ Database
                var category = _baseService.GetById<Category>(id);

                // 3. Quan trọng: Check NULL và Check Quyền sở hữu
                // Nếu category không tồn tại HOẶC không phải của user này -> Báo lỗi
                if (category == null || category.UserId != userId)
                {
                    return BadRequest("Dữ liệu không tồn tại hoặc bạn không có quyền xóa.");
                }

                // 4. Xử lý Xóa mềm (Soft Delete)
                category.IsDelete = true;

                // Cập nhật lại vào DB
                _baseService.Update(category);

                return Ok(new { success = true, message = "Xóa danh mục thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi server: " + ex.Message);
            }
        }

    }
}
