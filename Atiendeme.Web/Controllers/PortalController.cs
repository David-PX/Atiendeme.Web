using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Atiendeme.Web.Controllers
{
    [Authorize]
    public class PortalController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}