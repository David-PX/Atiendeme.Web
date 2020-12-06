using Atiendeme.Contratos.Repository;
using Atiendeme.Contratos.Repository.SQL;
using Atiendeme.DAL.SQL;
using Atiendeme.Repositorio.SQL;

namespace Atiendeme.Repositorio
{
    public class AtiendemeUnitOfWork : IAtiendemeUnitOfWork
    {
        private readonly ApplicationDbContext _applicationDbContext;

        public AtiendemeUnitOfWork(ApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;

            MedicoRepository = new MedicoRepository(_applicationDbContext);
        }

        public IMedicoRepository MedicoRepository { get; }

        public void Complete()
        {
            _applicationDbContext.SaveChanges();
        }
    }
}