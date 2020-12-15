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
    public class DoctorRepository : IDoctorRepository
    {
        private readonly IApplicationDbContext _applicationDbContext;

        private readonly UserManager<ApplicationUser> _userManager;

        private readonly IMapper _mapper;

        private readonly IEmailSender _emailSender;

        public DoctorRepository(IApplicationDbContext applicationDbContext, UserManager<ApplicationUser> userManager,
            IMapper mapper, IEmailSender emailSender)
        {
            _emailSender = emailSender;
            _applicationDbContext = applicationDbContext;
            _userManager = userManager;
            _mapper = mapper;
        }

        public async Task<List<DoctorDto>> GetDoctorsAsync()
        {
            var users = await (from u in _applicationDbContext.AspNetUsers
                               join ur in _applicationDbContext.AspNetUserRoles on u.Id equals ur.UserId
                               join r in _applicationDbContext.AspNetRoles on ur.RoleId equals r.Id
                               where (r.Name == DefaultRoles.Doctor)
                               select new DoctorDto
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
                               }).AsNoTracking().ToListAsync();

            for (int i = 0; i < users.Count; i++)
            {
                //Get Offices
                var offices = await _applicationDbContext.Offices.Where(x => x.OfficesDoctors.Any(x => x.DoctorId == users[i].Id)).ToListAsync();
                users[i].Offices = _mapper.Map<List<OfficeDto>>(offices);

                //Specialties
                users[i].Specialties = await _applicationDbContext.Specialties.Where(x => x.SpecialtiesDoctor.Any(x => x.DoctorId == users[i].Id)).ToListAsync();

                //Horarios
                var doctorDays = await _applicationDbContext.DoctorLaborDays.Where(x => x.DoctorId == users[i].Id).ToListAsync();
                users[i].DoctorLaborDays = _mapper.Map<List<DoctorLaborDaysDto>>(doctorDays);
            }

            return users;
        }

        public async Task<ApplicationUserDto> GetDoctorAsync(string Id)
        {
            var user = await (from u in _applicationDbContext.AspNetUsers
                              join ur in _applicationDbContext.AspNetUserRoles on u.Id equals ur.UserId
                              join r in _applicationDbContext.AspNetRoles on ur.RoleId equals r.Id
                              where r.Name == DefaultRoles.Doctor
                              where u.Id == Id
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
                              }).FirstOrDefaultAsync();

            return user;
        }

        public async Task<ApplicationUser> SaveDoctorAsync(ApplicationUser medico, string pswd, string baseUrl)
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

                    var code = await _userManager.GenerateEmailConfirmationTokenAsync(medico);

                    code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

                    var callbackUrl = $"{baseUrl}/Identity/Account/ConfirmEmail?userId={medico.Id}&code={code}&returnUrl=%2F";

                    await _emailSender.SendEmailAsync(medico.Email, "Atiendeme - Confirma tu correo",
                        $"Favor confirmar su correo dando <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>clic aquí</a>.");

                    return _medico;
                }
                return null;
            }
            return null;
        }

        public async Task<List<DoctorLaborDays>> SaveDoctorLaborDays(List<DoctorLaborDays> doctorLaborDays)
        {
            //Sacar esto a la capa de servicio
            foreach (var item in doctorLaborDays)
            {
                _ = await _applicationDbContext.DoctorLaborDays.AddAsync(item);
            }

            await _applicationDbContext.SaveChangesAsync();
            return doctorLaborDays;
        }

        public async Task<List<DoctorLaborDays>> GetDoctorLaborDays(string doctorId)
        {
            return await _applicationDbContext.DoctorLaborDays.Where(x => x.DoctorId == doctorId).ToListAsync();
        }

        public async Task<List<DoctorLaborDays>> GetDoctorLaborDays(string doctorId, int officeId)
        {
            return await _applicationDbContext.DoctorLaborDays.Where(x => x.DoctorId == doctorId && x.OfficeId == officeId).ToListAsync();
        }

        public List<DoctorLaborDays> RemoveLaborDays(List<DoctorLaborDays> doctorLaborDays)
        {
            _applicationDbContext.DoctorLaborDays.RemoveRange(doctorLaborDays.ToArray());
            _applicationDbContext.SaveChangesAsync();

            return doctorLaborDays;
        }

        public DoctorDto RemoveDoctor(ApplicationUser search)
        {
            var result = _applicationDbContext.AspNetUsers.Remove(search);
            _applicationDbContext.SaveChanges();

            var mapperResult = _mapper.Map<DoctorDto>(result.Entity);

            return mapperResult;
        }

        public DoctorDto UpdateDoctor(ApplicationUser search)
        {
            var result = _applicationDbContext.AspNetUsers.Update(search);
            _applicationDbContext.SaveChanges();

            var mapperResult = _mapper.Map<DoctorDto>(result.Entity);

            return mapperResult;
        }
    }
}