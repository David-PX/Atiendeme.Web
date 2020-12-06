using Atiendeme.Entidades.Entidades.SQL;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Atiendeme.Contratos.Repository.SQL
{
    public interface ISpecialtiesRepository
    {
        Task<List<Specialties>> GetSpecialties();

        Task<Specialties> GetSpecialty(int id);

        Task<Specialties> SaveSpecialty(Specialties specialy);
    }
}