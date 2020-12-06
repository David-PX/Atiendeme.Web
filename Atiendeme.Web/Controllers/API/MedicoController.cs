using Atiendeme.Contratos.Repository;
using Atiendeme.Entidades.Entidades.SQL;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Atiendeme.Web.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MedicoController : ControllerBase
    {
        private readonly ILogger<MedicoController> _logger;

        private readonly IAtiendemeUnitOfWork _atiendemeUnitOfWork;

        public MedicoController(ILogger<MedicoController> logger, UserManager<ApplicationUser> userManager,
            IAtiendemeUnitOfWork atiendemeUnitOfWork)
        {
            _logger = logger;
            _atiendemeUnitOfWork = atiendemeUnitOfWork;
        }

        [HttpGet]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<List<ApplicationUser>>> Get()
        {
            var result = await _atiendemeUnitOfWork.MedicoRepository.ObtenerMedicosAsync();

            return Ok(result);
        }
    }
}