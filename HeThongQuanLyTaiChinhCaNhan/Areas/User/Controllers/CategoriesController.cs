using Microsoft.AspNetCore.Mvc;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.Controllers
{
    [Area("User")]
    [Route("User/Categories")]
    public class CategoriesController : Controller
    {
        public IActionResult Index()
        {
            return View("Categories");
        }
    }
}
