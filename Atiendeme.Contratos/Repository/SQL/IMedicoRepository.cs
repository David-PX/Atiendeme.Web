using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Atiendeme.Contratos.Repository.SQL
{
    public interface IMedicoRepository
    {
        Task<List<ApplicationUserDto>> ObtenerMedicosAsync();

        Task<ApplicationUser> CrearMedicoAsync(ApplicationUser medico, string pswd);
    }
}