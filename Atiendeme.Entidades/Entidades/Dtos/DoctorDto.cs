using System.Collections.Generic;

namespace Atiendeme.Entidades.Entidades.Dtos
{
    public class DoctorDto : ApplicationUserDto
    {
        public List<DoctorLaborDaysDto> DoctorLaborDays { get; set; }
    }
}