using Atiendeme.Entidades.Entidades.SQL;
using System.Collections.Generic;

namespace Atiendeme.Entidades.Entidades.Dtos
{
    public class SecretaryDto : ApplicationUserDto
    {
        public List<SecretaryDoctor> SecretaryDoctors { get; set; }
    }
}