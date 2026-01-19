using Microsoft.AspNetCore.Mvc;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.Controllers
{
    [Area("User")]
    [Route("User/Tickets")]
    public class TicketsController : Controller
    {
        public IActionResult Index()
        {
            return View("Tickets");
        }
    }
}
