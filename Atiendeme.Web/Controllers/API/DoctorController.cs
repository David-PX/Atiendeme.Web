using Atiendeme.Contratos.Repository;
using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
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
    public class DoctorController : ControllerBase
    {
        private readonly ILogger<DoctorController> _logger;

        private readonly IAtiendemeUnitOfWork _atiendemeUnitOfWork;

        public readonly IMapper _mapper;

        public DoctorController(ILogger<DoctorController> logger, UserManager<ApplicationUser> userManager,
            IAtiendemeUnitOfWork atiendemeUnitOfWork, IMapper mapper)
        {
            _logger = logger;
            _atiendemeUnitOfWork = atiendemeUnitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<List<DoctorDto>>> Doctor()
        {
            var result = await _atiendemeUnitOfWork.DoctorRepository.GetDoctorsAsync();
            return StatusCode((int)HttpStatusCode.Created, result);
        }

        /// <summary>
        /// Se debe de agregar lo de los rangos de fecha, especialidades y centros
        /// </summary>
        /// <param name="medico"></param>
        /// <returns></returns>
        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<DoctorDto>> Doctor(DoctorDto medico)
        {
            var _medicoMapper = _mapper.Map<ApplicationUser>(medico);

            //Crea al medico
            var doctor = await _atiendemeUnitOfWork.DoctorRepository.SaveDoctorAsync(_medicoMapper, medico.Password);

            var _doctorLaborDays = _mapper.Map<List<DoctorLaborDays>>(medico.DoctorLaborDays);

            var resultSaveDoctorDays = await _atiendemeUnitOfWork.DoctorRepository.SaveDoctorLaborDays(_doctorLaborDays);

            //Agrega los horarios del medico
            DoctorDto mapperResult = _mapper.Map<DoctorDto>(doctor);
            mapperResult.DoctorLaborDays = _mapper.Map<List<DoctorLaborDaysDto>>(resultSaveDoctorDays);

            return StatusCode((int)HttpStatusCode.Created, doctor);
        }

        [HttpPost("[action]")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<DoctorLaborDaysDto>> DoctorLaborDay(List<DoctorLaborDaysDto> doctorLaborDays)
        {
            foreach (var item in doctorLaborDays)
            {
                var doctor = await _atiendemeUnitOfWork.DoctorRepository.GetDoctorAsync(item.DoctorId);

                if (doctor == null)
                    return BadRequest(("Doctor with Id {0} not found", item.DoctorId));
            }

            var _doctorLaborDays = _mapper.Map<List<DoctorLaborDays>>(doctorLaborDays);
            var resultSaveDoctorDays = await _atiendemeUnitOfWork.DoctorRepository.SaveDoctorLaborDays(_doctorLaborDays);

            var resultDto = _mapper.Map<List<DoctorLaborDaysDto>>(resultSaveDoctorDays);

            return StatusCode((int)HttpStatusCode.Created, resultDto);
        }
    }
}