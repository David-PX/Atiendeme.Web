using Atiendeme.Contratos.Repository;
using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
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
        public async Task<ActionResult<List<OfficeDto>>> Offices()
        {
            var result = await _atiendemeUnitOfWork.OfficeRepository.GetOffices();

            List<OfficeDto> officeDtos = new List<OfficeDto>();

            result.ForEach(x =>
            {
                var doctorsDto = _mapper.Map<List<ApplicationUserDto>>(x.OfficesDoctors.Select(x => x.Doctor));
                officeDtos.Add(
                    new OfficeDto
                    {
                        Address = x.Address,
                        Email = x.Email,
                        Id = x.Id,
                        Name = x.Name,
                        Telephone = x.Telephone,
                        Doctors = doctorsDto
                    });
            });

            return Ok(officeDtos);
        }

        [HttpGet("{Id}")]
        public async Task<ActionResult<Offices>> Office(int Id)
        {
            var result = await _atiendemeUnitOfWork.OfficeRepository.GetOffice(Id);
            if (result == null)
                return BadRequest();

            return Ok(result);
        }

        [HttpPatch]
        public async Task<ActionResult<Offices>> UpdateOffice(OfficeDto officeDto)
        {
            var officesDoctors = await _atiendemeUnitOfWork.OfficeRepository.GetOfficesDoctorsByOfficeId(officeDto.Id);

            if (officeDto.Doctors != null)
            {
                if (officesDoctors != null)
                {
                    var doctorsNotFound = officesDoctors.Where(x => !officeDto.Doctors.Any(u => u.Id == x.DoctorId)).ToArray();

                    if (doctorsNotFound.Length > 0)
                        _atiendemeUnitOfWork.OfficeRepository.DeleteOfficeDoctors(doctorsNotFound);
                }
            }
            else
            {
                if (officesDoctors != null)
                    _atiendemeUnitOfWork.OfficeRepository.DeleteOfficeDoctors(officesDoctors.ToArray());
            }

            var office = _mapper.Map<Offices>(officeDto);

            office = _atiendemeUnitOfWork.OfficeRepository.UpdateOffice(office);

            if (office == null)
                return StatusCode((int)HttpStatusCode.InternalServerError);

            //officeDto = _mapper.Map<OfficeDto>(office);

            //officeDto.Doctors = office.OfficesDoctors.Select(x => _mapper.Map<ApplicationUserDto>(x.Doctor)).ToList();
            return Ok(officeDto);
        }

        [HttpPost]
        public async Task<ActionResult<Offices>> Office(OfficeDto officeDto)
        {
            var office = _mapper.Map<Offices>(officeDto);
            var result = await _atiendemeUnitOfWork.OfficeRepository.SaveOffice(office);

            if (result == null)
                return StatusCode((int)HttpStatusCode.InternalServerError);

            if (officeDto.Doctors != null && officeDto.Doctors.Count > 0)
            {
                var officesDoctor = new List<OfficesDoctors>();

                for (var i = 0; i < officeDto.Doctors.Count; i++)
                {
                    officesDoctor.Add(new OfficesDoctors
                    {
                        DoctorId = officeDto.Doctors[i].Id,
                        OfficeId = result.Id
                    });
                }

                await _atiendemeUnitOfWork.OfficeRepository.SaveOfficesDoctor(officesDoctor.ToArray());

                result.OfficesDoctors = officesDoctor;
            }

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

        [HttpDelete("{Id}")]
        public async Task<ActionResult<Offices>> DeleteOffice(int Id)
        {
            var office = await _atiendemeUnitOfWork.OfficeRepository.GetOffice(Id);

            if (office == null)
                return NotFound();

            var result = _atiendemeUnitOfWork.OfficeRepository.DeleteOffice(office);

            if (result == null)
                return StatusCode((int)HttpStatusCode.InternalServerError);

            return Ok(result);
        }
    }
}