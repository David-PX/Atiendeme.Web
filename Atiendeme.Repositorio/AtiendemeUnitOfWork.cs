using Atiendeme.Contratos.Repository;
using Atiendeme.Contratos.Repository.SQL;
using Atiendeme.DAL.SQL;
using Atiendeme.Entidades.Entidades.SQL;
using Atiendeme.Repositorio.SQL;
using Microsoft.AspNetCore.Identity;

namespace Atiendeme.Repositorio
{
    public class AtiendemeUnitOfWork : IAtiendemeUnitOfWork
    {
        private readonly ApplicationDbContext _applicationDbContext;

        public AtiendemeUnitOfWork(ApplicationDbContext applicationDbContext, UserManager<ApplicationUser> userManager)
        {
            _applicationDbContext = applicationDbContext;

            DoctorRepository = new DoctorRepository(_applicationDbContext, userManager);
        }

        public IDoctorRepository DoctorRepository { get; }

        public void Complete()
        {
            _applicationDbContext.SaveChanges();
        }
    }
}