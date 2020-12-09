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
            SpecialtiesRepository = new SpecialtiesRepository(_applicationDbContext);
            OfficeRepository = new OfficeRepository(_applicationDbContext);
            ReservationRepository = new ReservationRepository(_applicationDbContext);
            UserRepository = new UserRepository(_applicationDbContext, userManager);
        }

        public IDoctorRepository DoctorRepository { get; }

        public ISpecialtiesRepository SpecialtiesRepository { get; }

        public IOfficeRepository OfficeRepository { get; }

        public IReservationRepository ReservationRepository { get; }

        public IUserRepository UserRepository { get; }

        public void Complete()
        {
            _applicationDbContext.SaveChanges();
        }
    }
}