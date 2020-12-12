using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Atiendeme.Contratos.Repository.SQL
{
    public interface IPatientRepository
    {
        Task<List<PatientDto>> GetPatients();

        Task<List<Dependents>> GetPatientDependents(string userId);

        Task<Dependents> GetDependent(int dependentId);

        Task<Dependents> SaveDependent(Dependents dependent);

        Dependents UpdateDependent(Dependents dependent);

        Dependents RemoveDependent(Dependents dependent);
    }
}