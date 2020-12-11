using Atiendeme.Entidades.Entidades.SQL;
using System.Collections.Generic;

namespace Atiendeme.Entidades.Entidades.Dtos
{
    public class DoctorDto : ApplicationUserDto
    {
        public List<DoctorLaborDaysDto> DoctorLaborDays { get; set; }

        public List<Specialties> Specialties { get; set; }

        public List<OfficeDto> Offices { get; set; }
    }
}