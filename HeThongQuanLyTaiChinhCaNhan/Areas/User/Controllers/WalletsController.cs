using Microsoft.AspNetCore.Mvc;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.Controllers
{
    [Area("User")]
    [Route("User/Wallets")]
    public class WalletsController : Controller
    {
        public IActionResult Index()
        {
            return View("Wallets");
        }
    }
}
