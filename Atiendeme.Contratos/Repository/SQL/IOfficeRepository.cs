using Atiendeme.Entidades.Entidades.SQL;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Atiendeme.Contratos.Repository.SQL
{
    public interface IOfficeRepository
    {
        Task<List<Offices>> GetOffices();

        Task<Offices> GetOffice(int Id);

        Task<Offices> SaveOffice(Offices office);

        Task<OfficesDoctors> SaveOfficeDoctor(OfficesDoctors officesDoctors);
    }
}