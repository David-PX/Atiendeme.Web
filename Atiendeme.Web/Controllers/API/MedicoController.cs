using Atiendeme.Contratos.Repository;
using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using AutoMapper;
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

        public readonly IMapper _mapper;

        public MedicoController(ILogger<MedicoController> logger, UserManager<ApplicationUser> userManager,
            IAtiendemeUnitOfWork atiendemeUnitOfWork, IMapper mapper)
        {
            _logger = logger;
            _atiendemeUnitOfWork = atiendemeUnitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<List<ApplicationUserDto>>> Get()
        {
            var result = await _atiendemeUnitOfWork.MedicoRepository.ObtenerMedicosAsync();
            return Ok(result);
        }

        /// <summary>
        /// Se debe de agregar lo de los rangos de fecha, especialidades y centros
        /// </summary>
        /// <param name="medico"></param>
        /// <returns></returns>
        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<ApplicationUserDto>> Post(ApplicationUserDto medico)
        {
            var _medicoMapper = _mapper.Map<ApplicationUser>(medico);

            var result = await _atiendemeUnitOfWork.MedicoRepository.CrearMedicoAsync(_medicoMapper, medico.Password);

            ApplicationUserDto mapperResult = _mapper.Map<ApplicationUserDto>(result);

            return Ok(mapperResult);
        }
    }
}