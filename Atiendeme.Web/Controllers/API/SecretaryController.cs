using Atiendeme.Contratos.Repository;
using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Atiendeme.Web.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class SecretaryController : ControllerBase
    {
        private readonly IAtiendemeUnitOfWork _atiendemeUnitOfWork;

        private readonly IMapper _mapper;

        public SecretaryController(IAtiendemeUnitOfWork atiendemeUnitOfWork, IMapper mapper)
        {
            _atiendemeUnitOfWork = atiendemeUnitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<List<SecretaryDto>>> Secretaries()
        {
            var result = await _atiendemeUnitOfWork.SecretaryRepository.GetSecretariesAsync();

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<SecretaryDto>> Secretaries(SecretaryDto secretaryDto)
        {
            var user = new ApplicationUser
            {
                UserName = secretaryDto.Email,
                Email = secretaryDto.Email,
                LastName = secretaryDto.LastName,
                Name = secretaryDto.Name,
                Birthday = secretaryDto.Birthday,
                Genre = secretaryDto.Genre,
                PhoneNumber = secretaryDto.PhoneNumber,
            };

            var result = await _atiendemeUnitOfWork.SecretaryRepository.SaveSecretaryAsync(user, secretaryDto.Password, Request.Host.ToString());
            secretaryDto.SecretaryDoctors.ForEach(x => x.SecretaryId = result.Id);
            var secretarydoctorsResult = await _atiendemeUnitOfWork.SecretaryRepository.SaveSecretaryDoctor(secretaryDto.SecretaryDoctors);

            var resultMapped = _mapper.Map<SecretaryDto>(result);
            return Ok(resultMapped);
        }

        [HttpPatch]
        public async Task<ActionResult<SecretaryDto>> UpdateSecretary(SecretaryDto secretary)
        {
            if (secretary == null)
                return BadRequest();

            var secretaryEntity = await _atiendemeUnitOfWork.UserRepository.GetUserEntity(secretary.Id);

            secretaryEntity.Id = secretary.Id;
            secretaryEntity.UserName = secretary.UserName;
            secretaryEntity.Email = secretary.Email;
            secretaryEntity.LastName = secretary.LastName;
            secretaryEntity.Name = secretary.Name;
            secretaryEntity.Birthday = secretary.Birthday;
            secretaryEntity.Genre = secretary.Genre;
            secretaryEntity.PhoneNumber = secretary.PhoneNumber;

            var updatedSecretary = _atiendemeUnitOfWork.SecretaryRepository.UpdateSecretary(secretaryEntity);

            //Add validation
            if (updatedSecretary == null)
                return StatusCode((int)HttpStatusCode.InternalServerError);

            ///
            List<SecretaryDoctor> secretaryDoctor = new List<SecretaryDoctor>();
            var currentSecretaryDoctors = await _atiendemeUnitOfWork.SecretaryRepository.GetSecretaryDoctor(secretary.Id);

            if (currentSecretaryDoctors == null)
                currentSecretaryDoctors = new List<SecretaryDoctor>();

            if (secretary.SecretaryDoctors != null)
            {
                if (currentSecretaryDoctors.Count > 0)
                {
                    var secretaryDoctorsNotFound = currentSecretaryDoctors.Where(x => !secretary.SecretaryDoctors.Any(u => u.Id == x.Id)).ToList();

                    if (secretaryDoctorsNotFound.Count > 0)
                    {
                        _atiendemeUnitOfWork.SecretaryRepository.RemoveSecretaryDoctor(secretaryDoctorsNotFound);
                    }
                }
            }
            else
            {
                if (currentSecretaryDoctors.Count > 0)
                    _atiendemeUnitOfWork.SecretaryRepository.RemoveSecretaryDoctor(currentSecretaryDoctors);
            }

            var finalSecretaryDoctor = secretary.SecretaryDoctors.Where(x => !currentSecretaryDoctors.Any(u => u.Id == x.Id)).ToList();

            if (finalSecretaryDoctor.Count > 0)
            {
                finalSecretaryDoctor.ForEach(x => x.SecretaryId = updatedSecretary.Id);
                await _atiendemeUnitOfWork.SecretaryRepository.SaveSecretaryDoctor(finalSecretaryDoctor);
            }
            return StatusCode((int)HttpStatusCode.Created, updatedSecretary);
        }

        [HttpDelete("{secretaryId}")]
        public async Task<ActionResult<SecretaryDto>> RemoveSecretary(string secretaryId)
        {
            if (secretaryId == null)
                return BadRequest();

            var search = await _atiendemeUnitOfWork.UserRepository.GetUserEntity(secretaryId);

            if (search == null)
                return NotFound();

            var userSecretaryDoctor = await _atiendemeUnitOfWork.SecretaryRepository.GetSecretaryDoctor(secretaryId);

            var resultRemoveSecretary = _atiendemeUnitOfWork.SecretaryRepository.RemoveSecretaryDoctor(userSecretaryDoctor);

            var result = _atiendemeUnitOfWork.SecretaryRepository.RemoveSecretary(search);

            if (result == null)
                return StatusCode((int)HttpStatusCode.InternalServerError);
            else
                return NoContent();
        }
    }
}