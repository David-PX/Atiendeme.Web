using Atiendeme.Entidades.Entidades.SQL;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Atiendeme.Contratos.DAL.SQL
{
    public interface IApplicationDbContext
    {
        DbSet<IdentityRole> AspNetRoles { get; set; }

        DbSet<ApplicationUser> AspNetUsers { get; set; }

        DbSet<IdentityUserRole<string>> AspNetUserRoles { get; set; }

        DbSet<Specialties> Specialties { get; set; }

        DbSet<SpecialtiesDoctor> SpecialtiesDoctors { get; set; }

        DbSet<Offices> Offices { get; set; }

        DbSet<OfficesDoctors> OfficesDoctors { get; set; }

        DbSet<DoctorLaborDays> DoctorLaborDays { get; set; }

        DbSet<Reservations> Reservations { get; set; }

        Task<int> SaveChangesAsync();

        int SaveChanges();
    }
}