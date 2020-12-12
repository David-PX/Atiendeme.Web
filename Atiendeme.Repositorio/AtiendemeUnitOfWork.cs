using Atiendeme.Contratos.Repository;
using Atiendeme.Contratos.Repository.SQL;
using Atiendeme.DAL.SQL;
using Atiendeme.Entidades.Entidades.SQL;
using Atiendeme.Repositorio.SQL;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;

namespace Atiendeme.Repositorio
{
    public class AtiendemeUnitOfWork : IAtiendemeUnitOfWork
    {
        private readonly ApplicationDbContext _applicationDbContext;

        public AtiendemeUnitOfWork(ApplicationDbContext applicationDbContext, UserManager<ApplicationUser> userManager, IMapper mapper, IEmailSender emailSender)
        {
            _applicationDbContext = applicationDbContext;

            DoctorRepository = new DoctorRepository(_applicationDbContext, userManager, mapper, emailSender);
            SpecialtiesRepository = new SpecialtiesRepository(_applicationDbContext);
            OfficeRepository = new OfficeRepository(_applicationDbContext);
            ReservationRepository = new ReservationRepository(_applicationDbContext);
            UserRepository = new UserRepository(_applicationDbContext, userManager);
            PatientRepository = new PatientRepository(_applicationDbContext, userManager, mapper, emailSender);
        }

        public IDoctorRepository DoctorRepository { get; }

        public ISpecialtiesRepository SpecialtiesRepository { get; }

        public IOfficeRepository OfficeRepository { get; }

        public IReservationRepository ReservationRepository { get; }

        public IUserRepository UserRepository { get; }

        public IPatientRepository PatientRepository { get; }

        public void Complete()
        {
            _applicationDbContext.SaveChanges();
        }
    }
}