using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using System.Threading.Tasks;

namespace Atiendeme.Contratos.Repository.SQL
{
    public interface IUserRepository
    {
        Task<ApplicationUserDto> GetUser(string Id);

        Task<ApplicationUser> GetUserEntity(string Id);
    }
}