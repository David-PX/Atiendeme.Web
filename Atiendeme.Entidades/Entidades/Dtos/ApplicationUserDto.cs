using System;
using System.ComponentModel.DataAnnotations;

namespace Atiendeme.Entidades.Entidades.Dtos
{
    public class ApplicationUserDto
    {
        [Required]
        public string Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        public DateTime Birthday { get; set; }

        [Required]
        public string Genre { get; set; }

        public string Role { get; set; }

        public string UserName { get; set; }

        public string Email { get; set; }

        public string PhoneNumber { get; set; }

        public string Password { get; set; }
    }
}