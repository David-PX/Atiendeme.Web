using Atiendeme.Contratos.Repository;
using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
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
            return Ok(result);
        }

        [HttpGet("[Action]/{doctorId}/{officeId}")]
        public async Task<ActionResult<List<DoctorLaborDaysDto>>> DoctorLaborDays(string doctorId, int officeId)
        {
            var result = await _atiendemeUnitOfWork.DoctorRepository.GetDoctorLaborDays(doctorId, officeId);
            var mapperResult = _mapper.Map<DoctorLaborDaysDto>(result);
            return Ok(mapperResult);
        }

        [HttpGet("[action]/{doctorId}/{officeId}/{day}")]
        public async Task<ActionResult<List<Reservations>>> DoctorAvailability(DateTime day, string doctorId, int officeId)
        {
            var result = await _atiendemeUnitOfWork.ReservationRepository.GetReservationsFromDoctor(doctorId, officeId, day);
            return Ok(result);
        }

        /// <summary>
        /// Se debe de agregar lo de los rangos de fecha, especialidades y centros
        /// </summary>
        /// <param name="medico"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<DoctorDto>> Doctor(DoctorDto medico)
        {
            //var _medicoMapper = _mapper.Map<ApplicationUser>(medico);
            //_medicoMapper.UserName = medico.Email;
            //Crea al medico

            var user = new ApplicationUser
            {
                UserName = medico.Email,
                Email = medico.Email,
                LastName = medico.LastName,
                Name = medico.Name,
                Birthday = medico.Birthday,
                Genre = medico.Genre,
                PhoneNumber = medico.PhoneNumber,
            };

            var doctor = await _atiendemeUnitOfWork.DoctorRepository.SaveDoctorAsync(user, medico.Password, Request.Host.ToString());

            //Add validation
            if (doctor == null)
                return StatusCode((int)HttpStatusCode.InternalServerError);

            var _doctorLaborDays = _mapper.Map<List<DoctorLaborDays>>(medico.DoctorLaborDays);

            List<OfficesDoctors> officesDoctors = new List<OfficesDoctors>();

            _doctorLaborDays.ForEach(_doctorLaborDay =>
            {
                _doctorLaborDay.DoctorId = doctor.Id;
                _doctorLaborDay.Office = null;

                if (!officesDoctors.Any(x => x.OfficeId == _doctorLaborDay.OfficeId))
                    officesDoctors.Add(new OfficesDoctors()
                    {
                        DoctorId = doctor.Id,
                        OfficeId = _doctorLaborDay.OfficeId
                    });
            });

            var resultSaveDoctorDays = new List<DoctorLaborDays>();
            OfficesDoctors[] resultSaveDoctorOffices;
            if (_doctorLaborDays.Count > 0)
                resultSaveDoctorDays = await _atiendemeUnitOfWork.DoctorRepository.SaveDoctorLaborDays(_doctorLaborDays);

            if (officesDoctors.Count > 0)
                resultSaveDoctorOffices = await _atiendemeUnitOfWork.OfficeRepository.SaveOfficesDoctor(officesDoctors.ToArray());

            var finalSpecialties = medico.Specialties.Select(x => new SpecialtiesDoctor()
            {
                DoctorId = doctor.Id,
                SpecialtyId = x.Id
            }).ToList();

            if (finalSpecialties.Count > 0)
                await _atiendemeUnitOfWork.SpecialtiesRepository.SaveSpecialtiesFromDoctor(finalSpecialties);

            //Agrega los horarios del medico
            DoctorDto mapperResult = _mapper.Map<DoctorDto>(doctor);
            mapperResult.DoctorLaborDays = _mapper.Map<List<DoctorLaborDaysDto>>(resultSaveDoctorDays);

            //mapperResult.Offices = _mapper.Map<List<OfficeDto>>(resultSaveDoctorOffices.ToList());

            return StatusCode((int)HttpStatusCode.Created, doctor);
        }

        [HttpPatch]
        public async Task<ActionResult<DoctorDto>> UpdateDoctor(DoctorDto medico)
        {
            if (medico == null)
                return BadRequest();

            var doctorEntity = await _atiendemeUnitOfWork.UserRepository.GetUserEntity(medico.Id);

            doctorEntity.Id = medico.Id;
            doctorEntity.UserName = medico.UserName;
            doctorEntity.Email = medico.Email;
            doctorEntity.LastName = medico.LastName;
            doctorEntity.Name = medico.Name;
            doctorEntity.Birthday = medico.Birthday;
            doctorEntity.Genre = medico.Genre;
            doctorEntity.PhoneNumber = medico.PhoneNumber;

            var updatedDoctor = _atiendemeUnitOfWork.DoctorRepository.UpdateDoctor(doctorEntity);

            //Add validation
            if (updatedDoctor == null)
                return StatusCode((int)HttpStatusCode.InternalServerError);

            ///
            List<OfficesDoctors> officesDoctors = new List<OfficesDoctors>();
            var currentOfficesDoctors = await _atiendemeUnitOfWork.OfficeRepository.GetOfficesDoctorsByDoctorId(medico.Id);

            if (currentOfficesDoctors == null)
                currentOfficesDoctors = new List<OfficesDoctors>();

            var doctorLaborDays = await _atiendemeUnitOfWork.DoctorRepository.GetDoctorLaborDays(medico.Id);
            if (medico.DoctorLaborDays != null)
            {
                if (doctorLaborDays != null)
                {
                    var doctorLaborDaysNotFound = doctorLaborDays.Where(x => !medico.DoctorLaborDays.Any(u => u.Id == x.Id)).ToList();

                    if (doctorLaborDaysNotFound.Count > 0)
                    {
                        _atiendemeUnitOfWork.DoctorRepository.RemoveLaborDays(doctorLaborDaysNotFound);
                    }
                }
            }
            else
            {
                if (doctorLaborDays != null)
                {
                    _atiendemeUnitOfWork.DoctorRepository.RemoveLaborDays(doctorLaborDays);
                }
            }

            var doctorSpecialties = await _atiendemeUnitOfWork.SpecialtiesRepository.GetDoctorSpecialties(medico.Id);
            if (medico.Specialties != null)
            {
                if (doctorSpecialties != null)
                {
                    var doctorSpecialtiesNotFound = doctorSpecialties.Where(x => !medico.Specialties.Any(u => u.Id == x.Id)).ToList();

                    if (doctorSpecialtiesNotFound.Count > 0)
                        _atiendemeUnitOfWork.SpecialtiesRepository.RemoveDoctorSpecialties(doctorSpecialtiesNotFound);
                }
            }
            else
            {
                if (doctorSpecialties != null)
                {
                    _atiendemeUnitOfWork.SpecialtiesRepository.RemoveDoctorSpecialties(doctorSpecialties);
                }
            }

            var finalSpecialties = new List<SpecialtiesDoctor>();
            var finalDoctorLaborDays = new List<DoctorLaborDays>();

            if (medico.Specialties != null && medico.Specialties.Count > 0)
            {
                finalSpecialties = medico.Specialties.Where(x => !doctorSpecialties.Any(u => u.Id == x.Id)).Select(x => new SpecialtiesDoctor()
                {
                    DoctorId = medico.Id,
                    SpecialtyId = x.Id
                }).ToList();

                if (finalSpecialties.Count > 0)
                    await _atiendemeUnitOfWork.SpecialtiesRepository.SaveSpecialtiesFromDoctor(finalSpecialties);
            }

            if (medico.DoctorLaborDays != null && medico.DoctorLaborDays.Count > 0)
            {
                finalDoctorLaborDays = medico.DoctorLaborDays.Where(l => l.Id == 0).Select(x => new DoctorLaborDays()
                {
                    DoctorId = medico.Id,
                    Id = 0,
                    Day = x.Day,
                    EndTime = x.EndTime,
                    OfficeId = x.OfficeId,
                    StartTime = x.StartTime,
                }).ToList();
                if (finalDoctorLaborDays.Count > 0)
                {
                    await _atiendemeUnitOfWork.DoctorRepository.SaveDoctorLaborDays(finalDoctorLaborDays);

                    finalDoctorLaborDays.ForEach(_doctorLaborDay =>
                    {
                        if (currentOfficesDoctors.Count == 0)
                        {
                            officesDoctors.Add(new OfficesDoctors()
                            {
                                DoctorId = medico.Id,
                                OfficeId = _doctorLaborDay.OfficeId
                            });
                        }
                        else
                        {
                            if (!officesDoctors.Any(x => x.OfficeId == _doctorLaborDay.OfficeId) && currentOfficesDoctors.Any(x => x.OfficeId == _doctorLaborDay.OfficeId))
                                officesDoctors.Add(new OfficesDoctors()
                                {
                                    DoctorId = medico.Id,
                                    OfficeId = _doctorLaborDay.OfficeId
                                });
                        }
                    });

                    await _atiendemeUnitOfWork.OfficeRepository.SaveOfficesDoctor(officesDoctors.ToArray());
                }
            }

            return StatusCode((int)HttpStatusCode.Created, updatedDoctor);
        }

        [HttpDelete("{doctorId}")]
        public async Task<ActionResult<DoctorLaborDaysDto>> Doctor(string doctorId)
        {
            var search = await _atiendemeUnitOfWork.UserRepository.GetUserEntity(doctorId);

            if (search == null)
                return NotFound();

            var userSecretaryDoctor = await _atiendemeUnitOfWork.SecretaryRepository.GetSecretaryDoctorByDoctorId(doctorId);

            var resultRemoveSecretary = _atiendemeUnitOfWork.SecretaryRepository.RemoveSecretaryDoctor(userSecretaryDoctor);

            var result = _atiendemeUnitOfWork.DoctorRepository.RemoveDoctor(search);

            if (result == null)
                return StatusCode((int)HttpStatusCode.InternalServerError);

            return Ok(result);
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