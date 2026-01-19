using Microsoft.AspNetCore.Mvc;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.Controllers
{
    [Area("User")]
    [Route("User/Goals")]
    public class GoalsController : Controller
    {
        public IActionResult Index()
        {
            return View("Goals");
        }
    }
}
