using Atiendeme.Contratos.DAL.SQL;
using Atiendeme.Contratos.Repository.SQL;
using Atiendeme.Entidades.Constante;
using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Atiendeme.Repositorio.SQL
{
    public class PatientRepository : IPatientRepository
    {
        private readonly IApplicationDbContext _applicationDbContext;

        private readonly UserManager<ApplicationUser> _userManager;

        private readonly IMapper _mapper;

        private readonly IEmailSender _emailSender;

        public PatientRepository(IApplicationDbContext applicationDbContext, UserManager<ApplicationUser> userManager,
            IMapper mapper, IEmailSender emailSender)
        {
            _emailSender = emailSender;
            _applicationDbContext = applicationDbContext;
            _userManager = userManager;
            _mapper = mapper;
        }

        public async Task<List<PatientDto>> GetPatients()
        {
            var users = await (from u in _applicationDbContext.AspNetUsers
                               join ur in _applicationDbContext.AspNetUserRoles on u.Id equals ur.UserId
                               join r in _applicationDbContext.AspNetRoles on ur.RoleId equals r.Id
                               where (r.Name == DefaultRoles.Paciente)
                               select new PatientDto
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

            //Horarios
            for (int i = 0; i < users.Count; i++)
            {
                var dependents = await _applicationDbContext.Dependents.Where(x => x.PatientId == users[i].Id).ToListAsync();
                users[i].Dependents = _mapper.Map<List<DependentsDto>>(dependents);
            }

            return users;
        }

        public async Task<List<Dependents>> GetPatientDependents(string userId)
        {
            var dependents = await _applicationDbContext.Dependents.Where(x => x.PatientId == userId).ToListAsync();
            //var dependentsDtos = _mapper.Map<List<DependentsDto>>(dependents);

            return dependents;
        }

        public async Task<Dependents> GetDependent(int dependentId)
        {
            var dependents = await _applicationDbContext.Dependents.FirstOrDefaultAsync(x => x.Id == dependentId);
            //var dependentsDtos = _mapper.Map<DependentsDto>(dependents);

            return dependents;
        }

        public async Task<Dependents> SaveDependent(Dependents dependent)
        {
            var _dependent = await _applicationDbContext.Dependents.AddAsync(dependent);
            await _applicationDbContext.SaveChangesAsync();
            return _dependent.Entity;
        }

        public async Task<Dependents> UpdateDependent(Dependents dependent)
        {
            var _dependents = _applicationDbContext.Dependents.Update(dependent);
            await _applicationDbContext.SaveChangesAsync();
            return _dependents.Entity;
        }

        public async Task<Dependents> RemoveDependent(Dependents dependent)
        {
            var _dependents = _applicationDbContext.Dependents.Remove(dependent);
            await _applicationDbContext.SaveChangesAsync();
            return _dependents.Entity;
        }
    }
}