using Atiendeme.Contratos.Repository;
using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using AutoMapper;
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

        private readonly IMapper _mapper;

        public SpecialtiesController(ILogger<SpecialtiesController> logger, IMapper mapper, IAtiendemeUnitOfWork atiendemeUnitOfWork)
        {
            _logger = logger;
            _atiendemeUnitOfWork = atiendemeUnitOfWork;
            _mapper = mapper;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<List<Specialties>>> Specialty(int id)
        {
            if (id == 0)
                return BadRequest("Id no puede ser nulo");

            var result = await _atiendemeUnitOfWork.SpecialtiesRepository.GetSpecialty(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<List<Specialties>>> Specialties()
        {
            var result = await _atiendemeUnitOfWork.SpecialtiesRepository.GetSpecialties();
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Specialties>> Specialty(Specialties specialty)
        {
            specialty.Id = 0; //prevent issue with identity
            var result = await _atiendemeUnitOfWork.SpecialtiesRepository.SaveSpecialty(specialty);
            return StatusCode((int)HttpStatusCode.Created, result);
        }

        [HttpPost("[action]")]
        public async Task<ActionResult<SpecialtiesDoctorDto>> SpecialtiesDoctor(List<SpecialtiesDoctorDto> specialtiesDoctor)
        {
            var specialtiesDoctorEntity = _mapper.Map<List<SpecialtiesDoctor>>(specialtiesDoctor);
            var result = await _atiendemeUnitOfWork.SpecialtiesRepository.SaveSpecialtiesFromDoctor(specialtiesDoctorEntity);
            return StatusCode((int)HttpStatusCode.Created, result);
        }
    }
}