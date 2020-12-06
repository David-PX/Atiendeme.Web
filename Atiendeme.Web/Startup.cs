using Atiendeme.Contratos.DAL.SQL;
using Atiendeme.Contratos.Repository;
using Atiendeme.Contratos.Repository.SQL;
using Atiendeme.DAL.SQL;
using Atiendeme.Entidades.Entidades.Sengrid;
using Atiendeme.Entidades.Entidades.SQL;
using Atiendeme.Repositorio;
using Atiendeme.Repositorio.SQL;
using Atiendeme.Services;
using Atiendeme.Web.Configuration;
using Atiendeme.Web.Mapping;
using AutoMapper;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

namespace Atiendeme.Web
{
    public class Startup
    {
        private ILoggerFactory _loggerFactory;

        private ILogger _moduleLogger;

        public IConfiguration Configuration;

        public static readonly Task CompletedTask = Task.CompletedTask;

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
               options.UseSqlServer(Configuration["ConnectionStrings:DefaultConnection"]));
            services.AddDefaultIdentity<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
                       .AddRoles<IdentityRole>()
                       .AddEntityFrameworkStores<ApplicationDbContext>();

            //services.AddAuthorization(options => options.AddPolicy("Administrador", authBuilder => { authBuilder.RequireRole("Administrador"); }));

            services.AddControllersWithViews();
            services.AddRazorPages();

            //
            services.AddScoped<IApplicationDbContext, ApplicationDbContext>();
            services.AddScoped<IMedicoRepository, MedicoRepository>();
            services.AddScoped<IAtiendemeUnitOfWork, AtiendemeUnitOfWork>();

            //

            services.Configure<IdentityOptions>(options =>
            {
                // Password settings.
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = true;
                options.Password.RequiredLength = 6;
                options.Password.RequiredUniqueChars = 1;

                // Lockout settings.
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;

                // User settings.
                options.User.AllowedUserNameCharacters =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
                options.User.RequireUniqueEmail = true;
            });

            services.ConfigureApplicationCookie(options =>
            {
                // Cookie settings
                options.Cookie.HttpOnly = true;
                options.ExpireTimeSpan = TimeSpan.FromMinutes(5);

                options.LoginPath = "/Identity/Account/Login";
                options.AccessDeniedPath = "/Identity/Account/AccessDenied";
                options.SlidingExpiration = true;

                //Check
                options.Events.OnRedirectToAccessDenied = context =>
                {
                    //Return unathorized for api instead of 302
                    if (context.Request.Path.Value.StartsWith("/api"))
                    {
                        var result = JsonSerializer.Serialize(Configuration["Mensajes:AccesoRestringido"]);

                        context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                        context.HttpContext.Response.ContentType = "application/json";

                        return context.HttpContext.Response.WriteAsync(result);
                    }
                    context.Response.Redirect(context.RedirectUri);
                    return CompletedTask;
                };

                options.Events.OnRedirectToLogin = context =>
                {
                    if (context.Request.Path.Value.StartsWith("/api"))
                    {
                        var result = JsonSerializer.Serialize(Configuration["Mensajes:AccesoRestringido"]);

                        context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                        context.HttpContext.Response.ContentType = "application/json";

                        return context.HttpContext.Response.WriteAsync(result);
                    }
                    context.Response.Redirect(context.RedirectUri);
                    return CompletedTask;
                };
            });

            //Auto mapper
            var mappingConfig = new MapperConfiguration(mc =>
            {
                mc.AddProfile(new AtiendemeMapper());
            });
            IMapper mapper = mappingConfig.CreateMapper();
            services.AddSingleton(mapper);
            //

            services.AddTransient<IEmailSender, EmailSender>();
            services.Configure<AuthMessageSenderOptions>(Configuration);
            services.AddSwaggerGen();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, IServiceProvider serviceProvider)
        {
            _loggerFactory = new LoggerFactory();
            _moduleLogger = _loggerFactory.CreateLogger("Logger");

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();

                // Enable middleware to serve generated Swagger as a JSON endpoint.
                app.UseSwagger();

                // specifying the Swagger JSON endpoint.
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Atiendeme API");
                });
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
                endpoints.MapRazorPages();
            });

            CreateRoles.Configure(serviceProvider, _moduleLogger);
        }
    }
}