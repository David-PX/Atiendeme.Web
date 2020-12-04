using Microsoft.AspNetCore.Hosting;

[assembly: HostingStartup(typeof(Atiendeme.Web.Areas.Identity.IdentityHostingStartup))]

namespace Atiendeme.Web.Areas.Identity
{
    public class IdentityHostingStartup : IHostingStartup
    {
        public void Configure(IWebHostBuilder builder)
        {
            builder.ConfigureServices((context, services) =>
            {
            });
        }
    }
}