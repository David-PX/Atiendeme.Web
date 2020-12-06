using Atiendeme.Contratos.DAL.SQL;
using Atiendeme.Contratos.Repository.SQL;
using Atiendeme.Entidades.Entidades.SQL;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Atiendeme.Repositorio.SQL
{
    public class MedicoRepository : IMedicoRepository
    {
        private readonly IApplicationDbContext _applicationDbContext;

        public MedicoRepository(IApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;
        }

        public async Task<List<ApplicationUser>> ObtenerMedicosAsync()
        {
            //This can get better with a better model

            var role = await _applicationDbContext.AspNetRoles.FirstOrDefaultAsync(j => j.Name == "Doctor");
            var usersInRole = await _applicationDbContext.AspNetUserRoles.Where(j => j.RoleId == role.Id)
                                    .Select(x => x.UserId)
                                    .ToListAsync();

            var users = await _applicationDbContext.AspNetUsers.Where(user => usersInRole.Contains(user.Id)).ToListAsync();

            return users;
        }
    }
}