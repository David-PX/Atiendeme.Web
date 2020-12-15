using Atiendeme.Contratos.DAL.SQL;
using Atiendeme.Contratos.Repository.SQL;
using Atiendeme.Entidades.Entidades.SQL;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Atiendeme.Repositorio.SQL
{
    public class ReservationRepository : IReservationRepository
    {
        private readonly IApplicationDbContext _applicationDbContext;

        public ReservationRepository(IApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;
        }

        public async Task<List<Reservations>> GetReservationsAsync()
        {
            return await _applicationDbContext.Reservations.ToListAsync();
        }

        public async Task<List<Reservations>> GetReservationsAsync(DateTime day)
        {
            return await _applicationDbContext.Reservations.Where(r => r.StartTime >= day && day <= r.EndTime).ToListAsync();
        }

        public async Task<Reservations> GetReservationAsync(int reservationId)
        {
            return await _applicationDbContext.Reservations.FindAsync(reservationId);
        }

        public async Task<List<Reservations>> GetReservationFromUserAsync(string userId)
        {
            return await _applicationDbContext.Reservations
                                .Where(r => r.PatientId == userId)
                                .Include(x => x.Doctor)
                                .Include(x => x.Patient)
                                .Include(x => x.Dependent)
                                .Include(x => x.Office)
                                .Include(x => x.Specialty)
                                .ToListAsync();
        }

        public async Task<List<Reservations>> GetReservationFromUserAsync(string userId, string state)
        {
            return await _applicationDbContext.Reservations.Where(r => r.PatientId == userId && r.State == state).ToListAsync();
        }

        public async Task<List<Reservations>> GetReservationFromDoctorAsync(string doctorId)
        {
            return await _applicationDbContext.Reservations
                                .Include(x => x.Doctor)
                                .Include(x => x.Patient)
                                .Include(x => x.Dependent)
                                .Include(x => x.Office)
                                .Include(x => x.Specialty)
                                     .Where(r => r.DoctorId == doctorId)
                                     .AsNoTracking()
                                        .ToListAsync();
        }

        public async Task<List<Reservations>> GetReservationFromDoctorsAsync(List<string> doctorsId)
        {
            return await _applicationDbContext.Reservations
                 .Include(x => x.Doctor)
                                .Include(x => x.Patient)
                                .Include(x => x.Dependent)
                                .Include(x => x.Office)
                                .Include(x => x.Specialty)
                                .Where(r => doctorsId.Any(x => x == r.DoctorId))
                                .AsNoTracking().ToListAsync();
        }

        public async Task<List<Reservations>> GetReservationsFromDoctor(string doctorId, int officeId, DateTime day)
        {
            return await _applicationDbContext.Reservations.Where(r =>
                r.DoctorId == doctorId && r.OfficeId == officeId && (r.StartTime.Date <= day.Date && r.EndTime.Date >= day.Date)
                && r.State != "Cancelada"
                ).ToListAsync();
        }

        public async Task<Reservations> SaveReservation(Reservations reservation)
        {
            var result = await _applicationDbContext.Reservations.AddAsync(reservation);

            await _applicationDbContext.SaveChangesAsync();

            return result.Entity;
        }

        public bool DeleteReservation(Reservations reservation)
        {
            var deleted = _applicationDbContext.Reservations.Remove(reservation);

            _applicationDbContext.SaveChanges();

            return deleted.State == EntityState.Detached;
        }

        public Reservations ChangeReserveStatus(Reservations changeReserveStatus)
        {
            var reserve = _applicationDbContext.Reservations.Update(changeReserveStatus);
            _applicationDbContext.SaveChanges();

            return reserve.Entity;
        }
    }
}