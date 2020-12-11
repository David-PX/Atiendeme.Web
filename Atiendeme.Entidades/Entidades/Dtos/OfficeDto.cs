using System.Collections.Generic;

namespace Atiendeme.Entidades.Entidades.Dtos
{
    public class OfficeDto
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Telephone { get; set; }

        public string Email { get; set; }

        public string Address { get; set; }

        public List<ApplicationUserDto> Doctors { get; set; }
    }
}