using Atiendeme.Entidades.Entidades.Dtos;
using System.Threading.Tasks;

namespace Atiendeme.Contratos.Repository.SQL
{
    public interface IUserRepository
    {
        Task<ApplicationUserDto> GetUser(string Id);
    }
}