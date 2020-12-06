using Atiendeme.Contratos.DAL.SQL;
using Atiendeme.Entidades.Entidades.SQL;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Atiendeme.DAL.SQL
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<IdentityRole> AspNetRoles { get; set; }

        public DbSet<ApplicationUser> AspNetUsers { get; set; }

        public DbSet<IdentityUserRole<string>> AspNetUserRoles { get; set; }

        public DbSet<Specialties> Specialties { get; set; }

        Task<int> IApplicationDbContext.SaveChangesAsync()
        {
            return SaveChangesAsync();
        }

        int IApplicationDbContext.SaveChanges()
        {
            return SaveChanges();
        }
    }
}