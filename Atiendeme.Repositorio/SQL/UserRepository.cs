using Atiendeme.Contratos.DAL.SQL;
using Atiendeme.Contratos.Repository.SQL;
using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace Atiendeme.Repositorio.SQL
{
    //This one... can be merge with Doctor secretary and other [at least their common methods, prevent duplicate code] [TODO]
    public class UserRepository : IUserRepository
    {
        private readonly IApplicationDbContext _applicationDbContext;

        private readonly UserManager<ApplicationUser> _userManager;

        public UserRepository(IApplicationDbContext applicationDbContext, UserManager<ApplicationUser> userManager)
        {
            _applicationDbContext = applicationDbContext;
            _userManager = userManager;
        }

        public async Task<ApplicationUserDto> GetUser(string Id)
        {
            var users = await (from u in _applicationDbContext.AspNetUsers
                               join ur in _applicationDbContext.AspNetUserRoles on u.Id equals ur.UserId
                               join r in _applicationDbContext.AspNetRoles on ur.RoleId equals r.Id
                               where (u.Id == Id)
                               select new ApplicationUserDto
                               {
                                   Email = u.Email,
                                   PhoneNumber = u.PhoneNumber,
                                   Id = u.Id,
                                   Genre = u.Genre,
                                   Name = u.Name,
                                   LastName = u.LastName,
                                   UserName = u.UserName,
                                   Birthday = u.Birthday,
                                   Role = r.Name
                               }).AsNoTracking()
                                .FirstOrDefaultAsync()
                               .ConfigureAwait(false);

            return users;
        }

        public async Task<ApplicationUser> GetUserEntity(string Id)
        {
            var users = await _applicationDbContext.AspNetUsers.FindAsync(Id);

            return users;
        }
    }
}