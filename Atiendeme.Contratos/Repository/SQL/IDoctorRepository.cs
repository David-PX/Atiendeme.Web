using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Atiendeme.Contratos.Repository.SQL
{
    public interface IDoctorRepository
    {
        Task<List<DoctorDto>> GetDoctorsAsync();

        List<DoctorLaborDays> RemoveLaborDays(List<DoctorLaborDays> doctorLaborDays);

        Task<List<DoctorLaborDays>> GetDoctorLaborDays(string doctorId);

        Task<ApplicationUserDto> GetDoctorAsync(string Id);

        Task<ApplicationUser> SaveDoctorAsync(ApplicationUser medico, string pswd);

        Task<List<DoctorLaborDays>> SaveDoctorLaborDays(List<DoctorLaborDays> doctorLaborDays);

        DoctorDto UpdateDoctor(ApplicationUser doctor);

        DoctorDto RemoveDoctor(ApplicationUser doctor);
    }
}