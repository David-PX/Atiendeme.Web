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

        public async Task<Specialties> SaveSpecialty(Specialties specialty)
        {
            var saveResult = await _applicationDbContext.Specialties.AddAsync(specialty);
            await _applicationDbContext.SaveChangesAsync();
            return saveResult.Entity;
        }

        public async Task<List<SpecialtiesDoctor>> SaveSpecialtiesFromDoctor(List<SpecialtiesDoctor> specialtiesDoctors)
        {
            foreach (var item in specialtiesDoctors)
            {
                _ = await _applicationDbContext.SpecialtiesDoctors.AddAsync(item);
            }

            await _applicationDbContext.SaveChangesAsync();
            return specialtiesDoctors;
        }

        public async Task<Specialties> UpdateSpecialty(Specialties specialty)
        {
            var updateResult = _applicationDbContext.Specialties.Update(specialty);
            await _applicationDbContext.SaveChangesAsync();

            return updateResult.Entity;
        }
    }
}