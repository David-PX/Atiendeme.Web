using Atiendeme.Contratos.DAL.SQL;
using Atiendeme.Contratos.Repository.SQL;
using Atiendeme.Entidades.Entidades.SQL;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
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

        public async Task<List<SpecialtiesDoctor>> GetDoctorSpecialties(string doctorId)
        {
            return await _applicationDbContext.SpecialtiesDoctors.Where(x => x.DoctorId == doctorId).ToListAsync();
        }

        public List<SpecialtiesDoctor> RemoveDoctorSpecialties(List<SpecialtiesDoctor> specialtiesDoctors)
        {
            _applicationDbContext.SpecialtiesDoctors.RemoveRange(specialtiesDoctors.ToArray());
            _applicationDbContext.SaveChanges();

            return specialtiesDoctors;
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

        public Specialties UpdateSpecialty(Specialties specialty)
        {
            var updateResult = _applicationDbContext.Specialties.Update(specialty);
            _applicationDbContext.SaveChanges();

            return updateResult.Entity;
        }

        public Specialties DeleteSpecialty(Specialties specialty)
        {
            var updateResult = _applicationDbContext.Specialties.Remove(specialty);
            _applicationDbContext.SaveChanges();

            return updateResult.Entity;
        }
    }
}