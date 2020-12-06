using Atiendeme.Contratos.DAL.SQL;
using Atiendeme.Contratos.Repository.SQL;
using Atiendeme.Entidades.Entidades.SQL;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Atiendeme.Repositorio.SQL
{
    public class SpecialtiesRepository : ISpecialtiesRepository
    {
        private readonly IApplicationDbContext _applicationDbContext;

        public SpecialtiesRepository(IApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;
        }

        public async Task<List<Specialties>> GetSpecialties()
        {
            return await _applicationDbContext.Specialties.ToListAsync();
        }

        public async Task<Specialties> GetSpecialty(int id)
        {
            return await _applicationDbContext.Specialties.FirstOrDefaultAsync(specialty => specialty.Id == id);
        }

        public async Task<Specialties> SaveSpecialty(Specialties specialy)
        {
            var saveResult = await _applicationDbContext.Specialties.AddAsync(specialy);
            await _applicationDbContext.SaveChangesAsync();
            return saveResult.Entity;
        }
    }
}