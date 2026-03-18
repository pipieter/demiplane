using Demiplane.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace Demiplane.Server;

public partial class Server
{
    private readonly AssetService _assetService = new();
    private readonly ConcurrentBoardState _state = new();

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(
                "AllowAllCors",
                builder =>
                    builder.AllowAnyMethod().AllowCredentials().SetIsOriginAllowed((host) => true).AllowAnyHeader()
            );
        });
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        app.UseWebSockets();
        app.UseCors("AllowAllCors");
        app.Use(
            async (context, next) =>
            {
                if (context.WebSockets.IsWebSocketRequest)
                    await HandleWebSocket(context);
                else if (context.Request.Method == HttpMethods.Post)
                    await HandleHttpPost(context);
                else
                    await next();
            }
        );
        app.UseStaticFiles();
    }
}
