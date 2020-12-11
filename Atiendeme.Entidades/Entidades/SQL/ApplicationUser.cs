using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Atiendeme.Entidades.Entidades.SQL
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        public string Genre { get; set; }

        [Required]
        public DateTime Birthday { get; set; }
         
    }
}