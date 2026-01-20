using HeThongQuanLyTaiChinhCaNhan.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Transactions;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.User.Controllers
{
    [Area("User")]
    [Route("User/Transactions")]
    public class TransactionsController : Controller
    {
        private readonly IBaseService _baseService;
        public TransactionsController(IBaseService baseService)
        {
            _baseService = baseService;
        }
        public IActionResult Index()
        {
            return View("Transactions");
        }
    }
}
