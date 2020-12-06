using System.ComponentModel.DataAnnotations;

namespace Atiendeme.Entidades.Entidades.SQL
{
    public class SpecialtiesDoctor
    {
        [Key]
        public int Id { get; set; }

        public int SpecialtyId { get; set; }

        public string DoctorId { get; set; }

        public Specialties Specialty { get; set; }

        public ApplicationUser Doctor { get; set; }
    }
}