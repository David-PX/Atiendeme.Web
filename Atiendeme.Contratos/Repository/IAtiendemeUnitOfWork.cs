using Atiendeme.Contratos.Repository.SQL;

namespace Atiendeme.Contratos.Repository
{
    public interface IAtiendemeUnitOfWork
    {
        IMedicoRepository MedicoRepository { get; }
    }
}