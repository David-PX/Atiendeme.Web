using Atiendeme.Contratos.Repository.SQL;

namespace Atiendeme.Contratos.Repository
{
    public interface IAtiendemeUnitOfWork
    {
        IDoctorRepository DoctorRepository { get; }
    }
}