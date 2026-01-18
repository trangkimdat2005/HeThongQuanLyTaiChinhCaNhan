using HeThongQuanLyTaiChinhCaNhan.Models;
using Microsoft.AspNetCore.Mvc;

namespace HeThongQuanLyTaiChinhCaNhan.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class UsersController : Controller
    {
        private readonly AppDbContext context;

        public UsersController(AppDbContext context)
        {
            this.context = context;
        }

        public IActionResult Index()
        {
            ViewBag.users = context.Users.ToList();
            
            var users = context.Users.ToList();
            return View(users);
        }
        public IActionResult Add()
        {
            return View();
        }
        public IActionResult Edit()
        {
            return View();
        }
    }
}
