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

        public DbSet<Specialties> Specialties { get; set; }

        Task<int> SaveChangesAsync();

        int SaveChanges();
    }
}