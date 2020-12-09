using Atiendeme.Contratos.Repository;
using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Threading.Tasks;

namespace Atiendeme.Web.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OfficesController : ControllerBase
    {
        private readonly IAtiendemeUnitOfWork _atiendemeUnitOfWork;

        private readonly IMapper _mapper;

        public OfficesController(IAtiendemeUnitOfWork atiendemeUnitOfWork, IMapper mapper)
        {
            _atiendemeUnitOfWork = atiendemeUnitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<Offices>> Offices()
        {
            var result = await _atiendemeUnitOfWork.OfficeRepository.GetOffices();

            return Ok(result);
        }

        [HttpGet("{Id}")]
        public async Task<ActionResult<Offices>> Office(int Id)
        {
            var result = await _atiendemeUnitOfWork.OfficeRepository.GetOffice(Id);
            if (result == null)
                return BadRequest();

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Offices>> Office(Offices Office)
        {
            var result = await _atiendemeUnitOfWork.OfficeRepository.SaveOffice(Office);

            return StatusCode((int)HttpStatusCode.Created, result);
        }

        [HttpPost("[action]")]
        public async Task<ActionResult<OfficesDoctorsDto>> OfficeDoctor(OfficesDoctorsDto officesDoctorsDto)
        {
            var officesDoctors = _mapper.Map<OfficesDoctors>(officesDoctorsDto);
            var result = await _atiendemeUnitOfWork.OfficeRepository.SaveOfficeDoctor(officesDoctors);
            officesDoctorsDto = _mapper.Map<OfficesDoctorsDto>(result);

            return StatusCode((int)HttpStatusCode.Created, officesDoctorsDto);
        }
    }
}