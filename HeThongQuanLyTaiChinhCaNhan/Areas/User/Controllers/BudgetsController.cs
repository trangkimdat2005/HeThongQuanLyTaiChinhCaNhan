using Microsoft.AspNetCore.Mvc;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.Controllers
{
    [Area("User")]
    [Route("User/Budgets")]
    public class Budgetscontroller : Controller
    {
        public IActionResult Index()
        {
            return View("Budgets");
        }
    }
}
