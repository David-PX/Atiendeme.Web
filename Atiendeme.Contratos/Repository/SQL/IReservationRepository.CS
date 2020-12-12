using Atiendeme.Entidades.Entidades.SQL;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Atiendeme.Contratos.Repository.SQL
{
    public interface IReservationRepository
    {
        Task<List<Reservations>> GetReservationsAsync();

        Task<List<Reservations>> GetReservationsAsync(DateTime day);

        Task<Reservations> GetReservationAsync(int reservationId);

        Task<List<Reservations>> GetReservationFromUserAsync(string userId);

        Task<List<Reservations>> GetReservationFromUserAsync(string userId, string state);

        Task<List<Reservations>> GetReservationFromDoctorAsync(string doctorId);

        Task<Reservations> SaveReservation(Reservations reservation);

        bool DeleteReservation(Reservations reservation);
    }
}