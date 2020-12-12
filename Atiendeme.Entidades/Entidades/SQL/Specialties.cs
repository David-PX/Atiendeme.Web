using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Atiendeme.Entidades.Entidades.SQL
{
    public class Specialties
    {
        [Key]
        public int Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public List<SpecialtiesDoctor> SpecialtiesDoctor { get; set; }
    }
}