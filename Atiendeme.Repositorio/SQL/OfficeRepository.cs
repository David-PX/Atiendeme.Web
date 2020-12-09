using Atiendeme.Contratos.DAL.SQL;
using Atiendeme.Contratos.Repository.SQL;
using Atiendeme.Entidades.Entidades.SQL;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
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
            return await _applicationDbContext.Offices.ToListAsync();
        }

        public async Task<Offices> GetOffice(int Id)
        {
            return await _applicationDbContext.Offices.FindAsync(Id);
        }

        public async Task<Offices> SaveOffice(Offices office)
        {
            var SaveResult = await _applicationDbContext.Offices.AddAsync(office);
            await _applicationDbContext.SaveChangesAsync();
            return SaveResult.Entity;
        }

        public async Task<OfficesDoctors> SaveOfficeDoctor(OfficesDoctors officesDoctors)
        {
            var SaveResult = await _applicationDbContext.OfficesDoctors.AddAsync(officesDoctors);
            await _applicationDbContext.SaveChangesAsync();
            return SaveResult.Entity;
        }
    }
}