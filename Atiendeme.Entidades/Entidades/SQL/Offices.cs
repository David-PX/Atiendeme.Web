using Atiendeme.Entidades.Entidades.Dtos;
using System.Collections.Generic;

namespace Atiendeme.Entidades.Entidades.SQL
{
    public class Offices
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Telephone { get; set; }

        public string Email { get; set; }

        public string Address { get; set; }

        public List<OfficesDoctors> OfficesDoctors { get; set; }
    }
}