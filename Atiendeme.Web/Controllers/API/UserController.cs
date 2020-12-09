using Atiendeme.Contratos.Repository;
using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using Atiendeme.Web.Configuration;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Threading.Tasks;

namespace Atiendeme.Web.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly SignInManager<ApplicationUser> _signInManager;

        private readonly ILogger<UserController> _logger;

        private readonly IAtiendemeUnitOfWork _atiendemeUnitOfWork;

        public readonly IMapper _mapper;

        public UserController(ILogger<UserController> logger, UserManager<ApplicationUser> userManager,
            IAtiendemeUnitOfWork atiendemeUnitOfWork, IMapper mapper)
        {
            _logger = logger;
            _atiendemeUnitOfWork = atiendemeUnitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<ApplicationUserDto>> CurrentUser()
        {
            var currentUserId = User.GetUserId();
            var result = await _atiendemeUnitOfWork.UserRepository.GetUser(currentUserId);

            if (result == null)
            {
                await _signInManager.SignOutAsync();
                return StatusCode((int)HttpStatusCode.InternalServerError, "No se ha encontrado su usuario.");
            }

            return Ok(result);
        }
    }
}