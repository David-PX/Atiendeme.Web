using Atiendeme.Contratos.DAL.SQL;
using Atiendeme.Contratos.Repository.SQL;
using Atiendeme.Entidades.Entidades.SQL;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Atiendeme.Repositorio.SQL
{
    public class OfficeRepository : IOfficeRepository
    {
        private readonly IApplicationDbContext _applicationDbContext;

        public OfficeRepository(IApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;
        }

        public async Task<List<Offices>> GetOffices()
        {
            var offices = await _applicationDbContext.Offices
                                    .Include(x => x.OfficesDoctors)
                                        .ThenInclude(x => x.Doctor)
                                        .AsNoTracking()
                                    .ToListAsync().ConfigureAwait(false);

            return offices;
        }

        public async Task<List<OfficesDoctors>> GetOfficesDoctorsByOfficeId(int Id)
        {
            var offices = await _applicationDbContext.OfficesDoctors
                                    .Where(x => x.OfficeId == Id)
                                    .ToListAsync();
            return offices;
        }

        public async Task<List<OfficesDoctors>> GetOfficesDoctorsByDoctorId(string doctorId)
        {
            var offices = await _applicationDbContext.OfficesDoctors
                                    .Where(x => x.DoctorId == doctorId)
                                    .ToListAsync();
            return offices;
        }

        public async Task<Offices> GetOffice(int Id)
        {
            return await _applicationDbContext.Offices.FindAsync(Id);
        }

        public Offices DeleteOffice(Offices offices)
        {
            var deleteResult = _applicationDbContext.Offices.Remove(offices);
            _applicationDbContext.SaveChanges();
            return deleteResult.Entity;
        }

        public async Task<Offices> SaveOffice(Offices office)
        {
            var SaveResult = await _applicationDbContext.Offices.AddAsync(office);
            _applicationDbContext.SaveChanges();
            return SaveResult.Entity;
        }

        public async Task<OfficesDoctors> SaveOfficeDoctor(OfficesDoctors officesDoctors)
        {
            var SaveResult = await _applicationDbContext.OfficesDoctors.AddAsync(officesDoctors);
            await _applicationDbContext.SaveChangesAsync();
            return SaveResult.Entity;
        }

        public async Task<OfficesDoctors[]> SaveOfficesDoctor(OfficesDoctors[] officesDoctors)
        {
            await _applicationDbContext.OfficesDoctors.AddRangeAsync(officesDoctors);
            await _applicationDbContext.SaveChangesAsync();
            return officesDoctors;
        }

        public OfficesDoctors[] DeleteOfficeDoctors(OfficesDoctors[] officesDoctors)
        {
            _applicationDbContext.OfficesDoctors.RemoveRange(officesDoctors);
            _applicationDbContext.SaveChanges();

            return officesDoctors;
        }

        public Offices UpdateOffice(Offices office)
        {
            var result = _applicationDbContext.Offices.Update(office);
            _applicationDbContext.SaveChanges();
            return result.Entity;
        }
    }
}