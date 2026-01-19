using Microsoft.AspNetCore.Mvc;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.Controllers
{
    [Area("User")]
    [Route("User/Shared")]
    public class SharedController : Controller
    {
        public IActionResult Index()
        {
            return View("Shared");
        }
    }
}
