using System;
using System.ComponentModel.DataAnnotations;

namespace Atiendeme.Entidades.Entidades.SQL
{
    public class Reservations
    {
        [Key]
        public int Id { get; set; }

        public string DoctorId { get; set; }

        public int OfficeId { get; set; }

        public int SpecialtyId { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public string PatientId { get; set; }

        public bool CancelByUser { get; set; }

        public string State { get; set; }

        public DateTime CreatedDate { get; set; }

        public bool CreatedBySecretary { get; set; }

        public string SecretaryId { get; set; }

        public bool ForDependent { get; set; }

        public int? DependentId { get; set; }

        public ApplicationUser Patient { get; set; }

        public ApplicationUser Doctor { get; set; }

        public Dependents Dependent { get; set; }

        public Offices Office { get; set; }

        public Specialties Specialty { get; set; }
    }
}