using Atiendeme.Contratos.Repository;
using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using Atiendeme.Web.Configuration;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Atiendeme.Web.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationController : ControllerBase
    {
        private readonly IAtiendemeUnitOfWork _atiendemeUnitOfWork;

        public readonly IMapper _mapper;

        private readonly IEmailSender _emailSender;

        public ReservationController(IAtiendemeUnitOfWork atiendemeUnitOfWork, IMapper mapper, IEmailSender emailSender)
        {
            _atiendemeUnitOfWork = atiendemeUnitOfWork;
            _mapper = mapper;
            _emailSender = emailSender;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Reservations>> Reservation(int id)
        {
            if (id == 0)
                return BadRequest("Id no puede ser nulo");

            var result = await _atiendemeUnitOfWork.ReservationRepository.GetReservationAsync(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("[action]/{id}")]
        public async Task<ActionResult<Reservations>> DoctorReservations(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Id no puede ser nulo");

            var result = await _atiendemeUnitOfWork.ReservationRepository.GetReservationFromDoctorAsync(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<List<Reservations>>> Reservation()
        {
            var result = await _atiendemeUnitOfWork.ReservationRepository.GetReservationsAsync();

            return Ok(result);
        }

        [HttpGet("[action]")]
        public async Task<ActionResult<List<Reservations>>> CurrentUserReservation()
        {
            var userId = User.GetUserId();
            var result = await _atiendemeUnitOfWork.ReservationRepository.GetReservationFromUserAsync(userId);

            return Ok(result);
        }

        [HttpGet("[action]")]
        public async Task<ActionResult<List<Reservations>>> SecretaryReservationList()
        {
            var userId = User.GetUserId();

            var doctorsUnderSecretary = await _atiendemeUnitOfWork.SecretaryRepository.GetSecretaryDoctorComplete(userId);

            var doctorIds = doctorsUnderSecretary.Select(x => x.Doctor.Id).ToList();
            var result = await _atiendemeUnitOfWork.ReservationRepository.GetReservationFromDoctorsAsync(doctorIds);

            return Ok(result);
        }

        [HttpGet("[action]/{day}")]
        public async Task<ActionResult<List<Reservations>>> ReservationByDay(DateTime day)
        {
            var result = await _atiendemeUnitOfWork.ReservationRepository.GetReservationsAsync(day);

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = "PacientePolicy")]
        public async Task<ActionResult<Reservations>> Reservation(Reservations reservation)
        {
            reservation.CreatedBySecretary = false;
            reservation.CancelByUser = false;
            reservation.CreatedDate = DateTime.Now;

            var result = await _atiendemeUnitOfWork.ReservationRepository.SaveReservation(reservation);

            var currentUserEmail = User.GetUserEmail();
            await _emailSender.SendEmailAsync(currentUserEmail, "Atiendeme - Reservación",
                $"Su cita para el {reservation.StartTime.Date:MMM ddd d HH:mm yyyy} ha sido creada exitosamente.");

            return Ok(result);
        }

        [HttpPatch("[action]")]
        public async Task<ActionResult<Reservations>> ChangeReserveStatus(ChangeReserveStatusDto changeReserveStatus)
        {
            if (changeReserveStatus.ReserveId == 0 || string.IsNullOrWhiteSpace(changeReserveStatus.State))
                return BadRequest();

            var reserve = await _atiendemeUnitOfWork.ReservationRepository.GetReservationAsync(changeReserveStatus.ReserveId);

            if (reserve == null)
                return NotFound();

            reserve.State = changeReserveStatus.State;

            var result = _atiendemeUnitOfWork.ReservationRepository.ChangeReserveStatus(reserve);

            string userEmail = reserve.ForDependent ? reserve.Dependent.Email : reserve.Patient.Email;

            switch (changeReserveStatus.State)
            {
                case "Cancelada":
                    await _emailSender.SendEmailAsync(userEmail, "Atiendeme - Reservación",
                              $"Su cita para el {reserve.StartTime.Date:MMM ddd d HH:mm yyyy} ha sido cancelada.");
                    break;

                case "Completada":
                    await _emailSender.SendEmailAsync(userEmail, "Atiendeme - Reservación",
                              $"Su cita para el {reserve.StartTime.Date:MMM ddd d HH:mm yyyy} ha sido Completada.");
                    break;

                case "En Proceso":
                    await _emailSender.SendEmailAsync(userEmail, "Atiendeme - Reservación",
                              $"Su cita para el {reserve.StartTime.Date:MMM ddd d HH:mm yyyy} se encuentra en proceso.");
                    break;

                case "Aceptada":
                    await _emailSender.SendEmailAsync(userEmail, "Atiendeme - Reservación",
                              $"Su cita para el {reserve.StartTime.Date:MMM ddd d HH:mm yyyy} ha sido aceptada.");
                    break;
            }
            return Ok(result);
        }

        [HttpPost("[action]")]
        [Authorize(Policy = "SecretarioPolicy")]
        public async Task<ActionResult<Reservations>> ReservationSecretary(Reservations reservation)
        {
            reservation.SecretaryId = User.GetUserId();
            reservation.CreatedBySecretary = true;
            reservation.CancelByUser = false;
            reservation.CreatedDate = DateTime.Now;
            var result = await _atiendemeUnitOfWork.ReservationRepository.SaveReservation(reservation);

            return Ok(result);
        }

        [HttpDelete("{reservationId}")]
        [Authorize(Policy = "SecretarioPolicy")]
        public async Task<ActionResult> DeleteReservation(int reservationId)
        {
            var reservation = await _atiendemeUnitOfWork.ReservationRepository.GetReservationAsync(reservationId);

            if (reservation == null)
                return BadRequest("Reservacion no encontrada");

            if (reservation.State == "Completada")
                return BadRequest();

            var deleted = _atiendemeUnitOfWork.ReservationRepository.DeleteReservation(reservation);

            if (deleted)
                return NoContent();

            return StatusCode((int)HttpStatusCode.InternalServerError, "Error borrando");
        }
    }
}