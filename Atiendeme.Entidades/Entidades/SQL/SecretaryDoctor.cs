using System;
using System.ComponentModel.DataAnnotations;

namespace Atiendeme.Entidades.Entidades.SQL
{
    public class SecretaryDoctor
    {
        [Key]
        public int Id { get; set; }

        public string SecretaryId { get; set; }

        public string DoctorId { get; set; }

        public DateTime Since { get; set; }

        public virtual ApplicationUser Doctor { get; set; }

        public virtual ApplicationUser Secretary { get; set; }
    }
}