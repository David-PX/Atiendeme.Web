using Atiendeme.Contratos.Repository;
using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using Atiendeme.Web.Configuration;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

namespace Atiendeme.Web.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientController : ControllerBase
    {
        private readonly IAtiendemeUnitOfWork _atiendemeUnitOfWork;

        public readonly IMapper _mapper;

        public PatientController(IAtiendemeUnitOfWork atiendemeUnitOfWork, IMapper mapper)
        {
            _atiendemeUnitOfWork = atiendemeUnitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<List<PatientDto>>> Patients()
        {
            var result = await _atiendemeUnitOfWork.PatientRepository.GetPatients();
            return Ok(result);
        }

        [HttpPatch("[action]")]
        public async Task<ActionResult<DependentsDto>> Dependent(DependentsDto dependentsDto)
        {
            var search = await _atiendemeUnitOfWork.PatientRepository.GetDependent(dependentsDto.Id);

            var result = _atiendemeUnitOfWork.PatientRepository.UpdateDependent(search);

            if (result == null)
                return StatusCode((int)HttpStatusCode.InternalServerError);
            return Ok(result);
        }

        [HttpPost("Dependent")]
        public async Task<ActionResult<DependentsDto>> SaveDependent(DependentsDto dependentsDto)
        {
            var dependents = _mapper.Map<Dependents>(dependentsDto);

            var result = await _atiendemeUnitOfWork.PatientRepository.SaveDependent(dependents);

            if (result == null)
                return StatusCode((int)HttpStatusCode.InternalServerError);

            return Ok(result);
        }

        [HttpGet("[action]")]
        public async Task<ActionResult<List<DependentsDto>>> CurrentUserDependendents()
        {
            var userId = User.GetUserId();
            var result = await _atiendemeUnitOfWork.PatientRepository.GetPatientDependents(userId);

            var resultDto = _mapper.Map<List<DependentsDto>>(result);

            return Ok(resultDto);
        }

        [HttpDelete("Dependent/{dependentId}")]
        public async Task<ActionResult<List<DependentsDto>>> Dependent(int dependentId)
        {
            var search = await _atiendemeUnitOfWork.PatientRepository.GetDependent(dependentId);

            if (search == null)
                return NotFound();

            var result = _atiendemeUnitOfWork.PatientRepository.RemoveDependent(search);

            if (result == null)
                return StatusCode((int)HttpStatusCode.InternalServerError);

            return Ok(result);
        }
    }
}