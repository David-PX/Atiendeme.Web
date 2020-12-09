using System.ComponentModel.DataAnnotations;

namespace Atiendeme.Entidades.Entidades.SQL
{
    public class OfficesDoctors
    {
        [Key]
        public int Id { get; set; }

        public string DoctorId { get; set; }

        public int OfficeId { get; set; }

        public ApplicationUser Doctor { get; set; }

        public Offices Office { get; set; }
    }
}