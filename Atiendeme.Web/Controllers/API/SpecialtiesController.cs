using Atiendeme.Contratos.Repository;
using Atiendeme.Entidades.Entidades.SQL;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Net;
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

        [HttpGet("[action]/{id}")]
        public async Task<ActionResult<List<Specialties>>> Get(int id)
        {
            if (id == 0)
                return BadRequest("Id no puede ser nulo");

            var result = await _atiendemeUnitOfWork.SpecialtiesRepository.GetSpecialty(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<List<Specialties>>> GetAll()
        {
            var result = await _atiendemeUnitOfWork.SpecialtiesRepository.GetSpecialties();
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Specialties>> Post(Specialties specialty)
        {
            specialty.Id = 0; //prevent issue with identity
            var result = await _atiendemeUnitOfWork.SpecialtiesRepository.SaveSpecialty(specialty);
            return StatusCode((int)HttpStatusCode.Created, result);
        }
    }
}