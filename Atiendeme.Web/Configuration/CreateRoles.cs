using Atiendeme.Entidades.Constante;
using Atiendeme.Entidades.Entidades.SQL;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;

namespace Atiendeme.Web.Configuration
{
    public static class CreateRoles
    {
        public static void Configure(IServiceProvider serviceProvider, ILogger _logger)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            //Mover esto y volverlo
            string[] rolesNames = { DefaultRoles.Administrador, DefaultRoles.Paciente, DefaultRoles.Doctor, DefaultRoles.Secretario };

            //Check if the defaults rols are created and create them if not
            CreateDefaultRoles(serviceProvider, _logger, rolesNames);

            string email = "admin@atiendeme.com";
            ApplicationUser testUser = userManager.FindByEmailAsync(email).Result;

            //Add admin user if is not created
            if (testUser == null)
            {
                ApplicationUser administrator = new ApplicationUser() { Email = email, UserName = email, EmailConfirmed = true, Genre = "Masculino", LastName = "Administrador", Name = "Administrador" };

                IdentityResult newUser = userManager.CreateAsync(administrator, "Atiendeme123").Result;

                if (newUser.Succeeded)
                {
                    userManager.AddToRoleAsync(administrator, DefaultRoles.Administrador);
                }
                else
                {
                    _logger.LogError($"Admin could not be created");
                }
            }
        }

        private static bool CreateRoleIfNotExist(RoleManager<IdentityRole> roleManager, string rol)
        {
            bool adminRoleExist = roleManager.RoleExistsAsync(rol).Result;
            IdentityResult roleResult;

            if (!adminRoleExist)
            {
                roleResult = roleManager.CreateAsync(new IdentityRole(rol)).Result;
                return roleResult.Succeeded;
            }
            return false;
        }

        private static void CreateDefaultRoles(IServiceProvider serviceProvider, ILogger _logger, string[] rolsNames)
        {
            RoleManager<IdentityRole> roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            for (var i = 0; i < rolsNames.Length; i++)
            {
                var rolAdded = CreateRoleIfNotExist(roleManager, rolsNames[i]);

                if (rolAdded)
                {
                    _logger.LogInformation($"Role: {rolsNames[i]} created");
                }
            }
        }
    }
}