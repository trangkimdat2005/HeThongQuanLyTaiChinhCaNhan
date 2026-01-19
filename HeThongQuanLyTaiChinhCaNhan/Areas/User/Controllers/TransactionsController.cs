using Microsoft.AspNetCore.Mvc;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.Controllers
{
    [Area("User")]
    [Route("User/Transactions")]
    public class TransactionsController : Controller
    {
        public IActionResult Index()
        {
            return View("Transactions");
        }
    }
}
