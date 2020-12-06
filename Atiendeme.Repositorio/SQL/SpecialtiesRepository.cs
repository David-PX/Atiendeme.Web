using Atiendeme.Contratos.DAL.SQL;
using Atiendeme.Contratos.Repository.SQL;

namespace Atiendeme.Repositorio.SQL
{
    public class SpecialtiesRepository : ISpecialtiesRepository
    {
        private readonly IApplicationDbContext _applicationDbContext;

        public SpecialtiesRepository(IApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;
        }

        public async Task<Especialidades> Get
    }
}