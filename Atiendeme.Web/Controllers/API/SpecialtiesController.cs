using Atiendeme.Contratos.Repository;
using Atiendeme.Entidades.Entidades.SQL;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Atiendeme.Web.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SpecialtiesController : ControllerBase
    {
        private readonly ILogger<SpecialtiesController> _logger;

        private readonly IAtiendemeUnitOfWork _atiendemeUnitOfWork;

        public SpecialtiesController(ILogger<SpecialtiesController> logger, IAtiendemeUnitOfWork atiendemeUnitOfWork)
        {
            _logger = logger;
            _atiendemeUnitOfWork = atiendemeUnitOfWork;
        }

        [HttpGet]
        public async Task<ActionResult<List<Specialties>>> Get()
        {
            var result = await _atiendemeUnitOfWork.DoctorRepository.GetDoctorsAsync();
            return Ok(result);
        }
    }
}