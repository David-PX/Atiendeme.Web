using Atiendeme.Entidades.Entidades.SQL;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Atiendeme.Contratos.Repository.SQL
{
    public interface ISpecialtiesRepository
    {
        Task<List<Specialties>> GetSpecialties();

        Task<List<SpecialtiesDoctor>> GetDoctorSpecialties(string doctorId);

        List<SpecialtiesDoctor> RemoveDoctorSpecialties(List<SpecialtiesDoctor> specialtiesDoctors);

        Task<Specialties> GetSpecialty(int id);

        Task<Specialties> SaveSpecialty(Specialties specialy);

        Task<List<SpecialtiesDoctor>> SaveSpecialtiesFromDoctor(List<SpecialtiesDoctor> specialtiesDoctors);

        Specialties UpdateSpecialty(Specialties specialty);

        Specialties DeleteSpecialty(Specialties specialty);
    }
}