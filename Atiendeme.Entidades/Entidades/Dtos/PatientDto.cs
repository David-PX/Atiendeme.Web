using System.Collections.Generic;

namespace Atiendeme.Entidades.Entidades.Dtos
{
    public class PatientDto : ApplicationUserDto
    {
        public List<DependentsDto> Dependents { get; set; }
    }
}