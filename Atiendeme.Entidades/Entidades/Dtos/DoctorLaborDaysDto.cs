using Atiendeme.Entidades.Entidades.SQL;

namespace Atiendeme.Entidades.Entidades.Dtos
{
    public class DoctorLaborDaysDto
    {
        public int Id { get; set; }

        public string DoctorId { get; set; }

        public int OfficeId { get; set; }

        public string StartTime { get; set; }

        public string EndTime { get; set; }

        public string Day { get; set; }

        public Offices Office { get; set; }

        public ApplicationUserDto Doctor { get; set; }
    }
}