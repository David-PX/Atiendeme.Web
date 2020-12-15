using Atiendeme.Contratos.DAL.SQL;
using Atiendeme.Contratos.Repository.SQL;
using Atiendeme.Entidades.Constante;
using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Threading.Tasks;

namespace Atiendeme.Repositorio.SQL
{
    public class SecretaryRepository : ISecretaryRepository
    {
        private readonly IApplicationDbContext _applicationDbContext;

        private readonly UserManager<ApplicationUser> _userManager;

        private readonly IEmailSender _emailSender;

        private readonly IMapper _mapper;

        public SecretaryRepository(IApplicationDbContext applicationDbContext, UserManager<ApplicationUser> userManager,
            IMapper mapper,
        IEmailSender emailSender)
        {
            _emailSender = emailSender;
            _applicationDbContext = applicationDbContext;
            _userManager = userManager;
            _mapper = mapper;
        }

        public async Task<List<SecretaryDto>> GetSecretariesAsync()
        {
            var users = await (from u in _applicationDbContext.AspNetUsers
                               join ur in _applicationDbContext.AspNetUserRoles on u.Id equals ur.UserId
                               join r in _applicationDbContext.AspNetRoles on ur.RoleId equals r.Id
                               where (r.Name == DefaultRoles.Secretario)
                               select new SecretaryDto
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

            for (int i = 0; i < users.Count; i++)
            {
                //Horarios
                var secretaryDoctors = await _applicationDbContext.SecretaryDoctor
                                                .Where(x => x.SecretaryId == users[i].Id)
                                                .Include(x => x.Doctor).AsNoTracking()
                                                    .ToListAsync();
                users[i].SecretaryDoctors = secretaryDoctors;//_mapper.Map<List<DoctorLaborDaysDto>>(secretaryDoctors);
            }

            return users;
        }

        public async Task<ApplicationUser> SaveSecretaryAsync(ApplicationUser secretary, string pswd, string baseUrl)
        {
            //Sacar esto a la capa de servicio

            var result = await _userManager.CreateAsync(secretary, pswd);

            if (result.Succeeded)
            {
                //Users created by the register method can just  be Pacientes
                var addRoleResult = await _userManager.AddToRoleAsync(secretary, DefaultRoles.Secretario);

                if (addRoleResult.Succeeded)
                {
                    var _secretary = await _applicationDbContext.AspNetUsers.FirstOrDefaultAsync(__secretary => __secretary.Email == secretary.Email);

                    var code = await _userManager.GenerateEmailConfirmationTokenAsync(secretary);

                    code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

                    var callbackUrl = $"{baseUrl}/Identity/Account/ConfirmEmail?userId={secretary.Id}&code={code}&returnUrl=%2F";

                    await _emailSender.SendEmailAsync(secretary.Email, "Atiendeme - Confirma tu correo",
                        $"Favor confirmar su correo dando <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>clic aquí</a>.");

                    return _secretary;
                }
                return null;
            }
            return null;
        }

        public ApplicationUser RemoveSecretary(ApplicationUser search)
        {
            var result = _applicationDbContext.AspNetUsers.Remove(search);
            _applicationDbContext.SaveChanges();

            return result.Entity;
        }

        public ApplicationUser UpdateSecretary(ApplicationUser search)
        {
            var result = _applicationDbContext.AspNetUsers.Update(search);
            _applicationDbContext.SaveChanges();

            return result.Entity;
        }

        public async Task<List<SecretaryDoctor>> GetSecretaryDoctor(string secretaryId)
        {
            var result = await _applicationDbContext.SecretaryDoctor.Where(secretaryDoctor => secretaryDoctor.SecretaryId == secretaryId).ToListAsync();

            return result;
        }

        public async Task<List<SecretaryDoctor>> GetSecretaryDoctorByDoctorId(string doctorId)
        {
            var result = await _applicationDbContext.SecretaryDoctor.Where(secretaryDoctor => secretaryDoctor.DoctorId == doctorId).ToListAsync();

            return result;
        }

        public async Task<List<SecretaryDoctor>> SaveSecretaryDoctor(List<SecretaryDoctor> secretaryDoctor)
        {
            await _applicationDbContext.SecretaryDoctor.AddRangeAsync(secretaryDoctor.ToArray());
            await _applicationDbContext.SaveChangesAsync();

            return secretaryDoctor;
        }

        public SecretaryDoctor UpdateSecretaryDoctor(SecretaryDoctor secretaryDoctor)
        {
            var result = _applicationDbContext.SecretaryDoctor.Update(secretaryDoctor);
            _applicationDbContext.SaveChanges();

            return result.Entity;
        }

        public List<SecretaryDoctor> RemoveSecretaryDoctor(List<SecretaryDoctor> secretaryDoctor)
        {
            _applicationDbContext.SecretaryDoctor.RemoveRange(secretaryDoctor);
            _applicationDbContext.SaveChanges();

            return secretaryDoctor;
        }
    }
}