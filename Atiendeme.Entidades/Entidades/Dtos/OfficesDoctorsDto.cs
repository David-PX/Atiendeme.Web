using Atiendeme.Entidades.Entidades.SQL;

namespace Atiendeme.Entidades.Entidades.Dtos
{
    public class OfficesDoctorsDto
    {
        public int Id { get; set; }

        public string DoctorId { get; set; }

        public int OfficeId { get; set; }

        public ApplicationUserDto Doctor { get; set; }

        public Offices Office { get; set; }
    }
}