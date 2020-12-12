using System.ComponentModel.DataAnnotations;

namespace Atiendeme.Entidades.Entidades.SQL
{
    public class Dependents
    {
        [Key]
        public int Id { get; set; }

        public string Name { get; set; }

        public string LastName { get; set; }

        public string Relationship { get; set; }

        public int Age { get; set; }

        public string Email { get; set; }

        public string IdCard { get; set; }

        public string PatientId { get; set; }

        public ApplicationUser Patient { get; set; }
    }
}