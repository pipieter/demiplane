using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using DotNetEnv;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using Server.Messages;
using Server.Tokens;
using Server.Util;

namespace Server;

public class Startup
{
    private readonly ConcurrentDictionary<WebSocket, string> _clients = new();
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
                {
                    WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
                    _clients.TryAdd(webSocket, "");

                    await HandleWebSocket(webSocket);
                }
                if (context.Request.Method == HttpMethods.Post && context.Request.Path == "/images")
                {
                    await HandleImageUpload(context);
                }
                else
                {
                    await next();
                }
            }
        );
        app.UseStaticFiles();
    }

    private static async Task HandleImageUpload(HttpContext context)
    {
        // Read the request body
        context.Request.EnableBuffering();
        using var reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
        var body = await reader.ReadToEndAsync();
        context.Request.Body.Position = 0; // Reset the stream position

        // If no body is given
        if (body == null)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = 400;
            await context.Response.WriteAsync("{\"status\": \"error\", \"message\":\"Could not receive data.\"}");
            return;
        }

        dynamic? contents = JsonConvert.DeserializeObject(body);
        dynamic? data = contents?.data?.Value;

        // If given data is not present or not a string
        if (data is not string)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = 400;
            await context.Response.WriteAsync(
                "{\"status\": \"error\", \"message\":\"Invalid or missing data field, expected string.\"}"
            );
            return;
        }

        string name = $"image-{Guid.NewGuid()}";
        ImageResult? result = Image.SaveBase64Image(name, data);
        if (result == null)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = 400;
            await context.Response.WriteAsync("{\"status\": \"error\", \"message\":\"Could not parse image.\"}");
            return;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = 200;
        await context.Response.WriteAsync($"{{\"status\": \"success\", \"href\": \"{result.href}\"}}");
        return;
    }

    private async Task ProcessMessage(WebSocket socket, string? message)
    {
        if (message == null)
            return;

        dynamic json = JsonConvert.DeserializeObject(message)!;
        if (json.type == "request_create")
        {
            Token? token = Token.Create(json.create);
            if (token == null)
                return;

            if (!_state.AddToken(token))
                return;

            CreateResponseMessage create = new(token);
            await BroadcastMessage(JsonConvert.SerializeObject(create));
        }
        else if (json.type == "request_move")
        {
            string id = json.move.id;
            int x = json.move.x;
            int y = json.move.y;

            if (!_state.MoveToken(id, x, y))
                return;

            MoveResponseMessage move = new(new MoveResponseMessage.Move(id, x, y));
            await BroadcastMessage(JsonConvert.SerializeObject(move));
        }
        else if (json.type == "request_grid")
        {
            _state.SetGrid((int)json.grid.size, (int)json.grid.offset.x, (int)json.grid.offset.y);

            GridResponseMessage gridResponse = new(_state.GetGrid());
            await BroadcastMessage(JsonConvert.SerializeObject(gridResponse));
        }
        else if (json.type == "request_background")
        {
            string href = json.href;
            Background? background = Background.FindFromHref(href);
            if (background == null)
                return;

            _state.SetBackground(background);
            BackgroundResponseMessage response = new(_state.GetBackground());
            await BroadcastMessage(JsonConvert.SerializeObject(response));
        }
    }

    private async Task HandleWebSocket(WebSocket socket)
    {
        GridResponseMessage gridResponse = new(_state.GetGrid());
        await SendMessage(socket, JsonConvert.SerializeObject(gridResponse));

        // Send the history to the socket
        foreach (var token in _state.Tokens())
        {
            CreateResponseMessage create = new(token);
            await SendMessage(socket, JsonConvert.SerializeObject(create));
        }
        // Send the background
        BackgroundResponseMessage background = new(_state.GetBackground());
        await BroadcastMessage(JsonConvert.SerializeObject(background));

        // A large buffer is required to upload image data
        var buffer = new byte[1024 * 1024 * 100];

        while (socket.State == WebSocketState.Open)
        {
            var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

            if (result.MessageType == WebSocketMessageType.Close)
            {
                // Close the message
                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                _clients.TryRemove(socket, out _);
            }
            else
            {
                var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                await ProcessMessage(socket, message);
            }
        }
    }

    private static async Task SendMessage(WebSocket socket, string message)
    {
        // TODO add a mutex here
        var buffer = Encoding.UTF8.GetBytes(message);
        var segment = new ArraySegment<byte>(buffer);
        if (socket.State == WebSocketState.Open)
        {
            await socket.SendAsync(segment, WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }

    private async Task BroadcastMessage(string message)
    {
        foreach (var client in _clients.Keys)
        {
            await SendMessage(client, message);
        }
    }
}

public class Program
{
    public static void Main(string[] args)
    {
        Env.Load(Path.Combine("..", ".env"));
        CreateHostBuilder(args).Build().Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args)
    {
        return Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
                webBuilder.UseUrls("http://localhost:5000");
            });
    }
}
