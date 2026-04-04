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

    public static void ConfigureServices(IServiceCollection services)
    {
        _ = services.AddCors(options =>
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
        _ = app.UseWebSockets();
        _ = app.UseCors("AllowAllCors");
        _ = app.Use(
            async (context, next) =>
            {
                if (context.WebSockets.IsWebSocketRequest)
                {
                    await HandleWebSocket(context);
                }
                else if (context.Request.Method == HttpMethods.Post)
                {
                    await HandleHttpPost(context);
                }
                else
                {
                    await next();
                }
            }
        );
        _ = app.UseStaticFiles();
    }
}
