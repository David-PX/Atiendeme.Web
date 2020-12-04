using Atiendeme.Entidades.Constante;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Atiendeme.Web.Configuration
{
    public static class CreateRoles
    {
        public static async Task Configure(IServiceProvider serviceProvider, ILogger _logger)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();
            //Mover esto y volverlo
            string[] rolesNames = { DefaultRoles.Administrador, DefaultRoles.Paciente, DefaultRoles.Doctor, DefaultRoles.Secretario };

            //Check if the defaults rols are created and create them if not
            //await CreateDefaultRoles(serviceProvider, _logger, rolesNames);

            //*
            RoleManager<IdentityRole> roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            for (var i = 0; i < rolesNames.Length - 1; i++)
            {
                //var rolAdded = await CreateRoleIfNotExist(roleManager, rolesNames[0]);

                bool roleExist = await roleManager.RoleExistsAsync(rolesNames[i]);

                IdentityResult roleResult;

                if (roleExist)
                {
                    roleResult = await roleManager.CreateAsync(new IdentityRole(rolesNames[i]));

                    if (roleResult.Succeeded)
                    {
                        _logger.LogInformation($"Role: {rolesNames[i]} created");
                    }
                }
            }

            //*

            string email = "admin@atiendeme.com";
            IdentityUser testUser = await userManager.FindByEmailAsync(email);

            //Add admin user if is not created
            if (testUser == null)
            {
                IdentityUser administrator = new IdentityUser() { Email = email, UserName = email };

                IdentityResult newUser = await userManager.CreateAsync(administrator, "Atiendeme123");

                if (newUser.Succeeded)
                {
                    await userManager.AddToRoleAsync(administrator, DefaultRoles.Administrador);
                }
                else
                {
                    _logger.LogError($"Admin could not be created");
                }
            }
        }

        private static async Task<bool> CreateRoleIfNotExist(RoleManager<IdentityRole> roleManager, string rol)
        {
            bool hasAdminRole = await roleManager.RoleExistsAsync(rol);
            IdentityResult roleResult;

            if (hasAdminRole)
            {
                roleResult = await roleManager.CreateAsync(new IdentityRole(rol));
                return roleResult.Succeeded;
            }
            return false;
        }

        private static async Task<bool> CreateDefaultRoles(IServiceProvider serviceProvider, ILogger _logger, string[] rolsNames)
        {
            RoleManager<IdentityRole> roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            bool atLeastOneRolCreated = false;
            for (var i = 0; i < rolsNames.Length - 1; i++)
            {
                var rolAdded = await CreateRoleIfNotExist(roleManager, rolsNames[0]);

                if (rolAdded)
                {
                    atLeastOneRolCreated = true;
                    _logger.LogInformation($"Role: {rolsNames[i]} created");
                }
            }

            return true;
        }
    }
}