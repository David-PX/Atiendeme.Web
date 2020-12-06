using Atiendeme.Contratos.DAL.SQL;
using Atiendeme.Contratos.Repository.SQL;
using Atiendeme.Entidades.Constante;
using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Atiendeme.Repositorio.SQL
{
    public class MedicoRepository : IMedicoRepository
    {
        private readonly IApplicationDbContext _applicationDbContext;

        private readonly UserManager<ApplicationUser> _userManager;

        public MedicoRepository(IApplicationDbContext applicationDbContext, UserManager<ApplicationUser> userManager)
        {
            _applicationDbContext = applicationDbContext;
            _userManager = userManager;
        }

        public async Task<List<ApplicationUserDto>> ObtenerMedicosAsync()
        {
            var users = await (from u in _applicationDbContext.AspNetUsers
                               join ur in _applicationDbContext.AspNetUserRoles on u.Id equals ur.UserId
                               join r in _applicationDbContext.AspNetRoles on ur.RoleId equals r.Id
                               where (r.Name == DefaultRoles.Doctor)
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
                               }).ToListAsync();

            return users;
        }

        public async Task<ApplicationUser> CrearMedicoAsync(ApplicationUser medico, string pswd)
        {
            //Sacar esto a la capa de servicio

            var result = await _userManager.CreateAsync(medico, pswd);

            if (result.Succeeded)
            {
                //Users created by the register method can just  be Pacientes
                var addRoleResult = await _userManager.AddToRoleAsync(medico, DefaultRoles.Doctor);

                if (addRoleResult.Succeeded)
                {
                    var _medico = await _applicationDbContext.AspNetUsers.FirstOrDefaultAsync(medico => medico.Email == medico.Email);

                    //var code = await _userManager.GenerateEmailConfirmationTokenAsync(medico);

                    //code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
                    //var callbackUrl = Url.Page(
                    //    "/Account/ConfirmEmail",
                    //    pageHandler: null,
                    //    values: new { area = "Identity", userId = medico.Id, code = code, returnUrl = "/" },
                    //    protocol: "http");

                    //await _emailSender.SendEmailAsync(medico.Email, "Atiendeme - Confirma tu correoConfirm ",
                    //    $"Favor confirmar su correo dando <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>clic aquí</a>.");

                    return _medico;
                }
                return null;
            }
            return null;
        }
    }
}