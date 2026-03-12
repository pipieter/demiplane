using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using DotNetEnv;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Server.Messages;
using Server.Tokens;

namespace Server;

public class Startup
{
    private readonly ConcurrentDictionary<WebSocket, string> _clients = new();
    private readonly ConcurrentBoardState _state = new();

    public void ConfigureServices(IServiceCollection services) { }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        app.UseWebSockets();
        app.Use(
            async (context, next) =>
            {
                if (context.WebSockets.IsWebSocketRequest)
                {
                    WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
                    _clients.TryAdd(webSocket, "");

                    await HandleWebSocket(webSocket);
                }
                else
                {
                    await next();
                }
            }
        );
        app.UseStaticFiles();
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
            _state.SetGrid(
                    (int)json.grid.size, 
                    (int)json.grid.offset.x, 
                    (int)json.grid.offset.y
                );

            GridResponseMessage gridResponse = new(_state.GetGrid());
            await BroadcastMessage(JsonConvert.SerializeObject(gridResponse));
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
