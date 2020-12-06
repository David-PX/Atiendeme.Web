using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Atiendeme.Contratos.Repository.SQL
{
    public interface IDoctorRepository
    {
        Task<List<ApplicationUserDto>> GetDoctorsAsync();

        Task<ApplicationUser> CrearMedicoAsync(ApplicationUser medico, string pswd);
    }
}