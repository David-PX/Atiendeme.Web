using Atiendeme.Entidades.Entidades.SQL;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Atiendeme.Contratos.Repository.SQL
{
    public interface IOfficeRepository
    {
        Task<List<Offices>> GetOffices();

        Task<Offices> GetOffice(int Id);

        Task<List<OfficesDoctors>> GetOfficesDoctorsByOfficeId(int Id);

        Task<Offices> SaveOffice(Offices office);

        Task<Offices> DeleteOffice(Offices offices);

        Task<OfficesDoctors[]> SaveOfficesDoctor(OfficesDoctors[] officesDoctors);

        Task<OfficesDoctors> SaveOfficeDoctor(OfficesDoctors officesDoctors);

        Task<OfficesDoctors[]> DeleteOfficeDoctors(OfficesDoctors[] officesDoctors);

        Task<Offices> UpdateOffice(Offices office);
    }
}