using Atiendeme.Entidades.Entidades.SQL;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Atiendeme.Contratos.Repository.SQL
{
    public interface IOfficeRepository
    {
        Task<List<Offices>> GetOffices();

        Task<Offices> GetOffice(int Id);

        Task<List<OfficesDoctors>> GetOfficesDoctorsByDoctorId(string doctorId);

        Task<List<OfficesDoctors>> GetOfficesDoctorsByOfficeId(int Id);

        Task<Offices> SaveOffice(Offices office);

        Offices DeleteOffice(Offices offices);

        Task<OfficesDoctors[]> SaveOfficesDoctor(OfficesDoctors[] officesDoctors);

        Task<OfficesDoctors> SaveOfficeDoctor(OfficesDoctors officesDoctors);

        OfficesDoctors[] DeleteOfficeDoctors(OfficesDoctors[] officesDoctors);

        Offices UpdateOffice(Offices office);
    }
}