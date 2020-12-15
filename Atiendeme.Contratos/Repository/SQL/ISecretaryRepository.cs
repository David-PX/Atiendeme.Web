using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Atiendeme.Contratos.Repository.SQL
{
    public interface ISecretaryRepository
    {
        Task<List<SecretaryDto>> GetSecretariesAsync();

        Task<ApplicationUser> SaveSecretaryAsync(ApplicationUser secretary, string pswd, string baseUrl);

        ApplicationUser RemoveSecretary(ApplicationUser search);

        ApplicationUser UpdateSecretary(ApplicationUser search);

        Task<List<SecretaryDoctor>> SaveSecretaryDoctor(List<SecretaryDoctor> secretaryDoctor);

        SecretaryDoctor UpdateSecretaryDoctor(SecretaryDoctor secretaryDoctor);

        Task<List<SecretaryDoctor>> GetSecretaryDoctor(string secretaryId);

        List<SecretaryDoctor> RemoveSecretaryDoctor(List<SecretaryDoctor> secretaryDoctor);

        Task<List<SecretaryDoctor>> GetSecretaryDoctorByDoctorId(string doctorId);

        Task<List<SecretaryDoctor>> GetSecretaryDoctorComplete(string secretaryId);
    }
}