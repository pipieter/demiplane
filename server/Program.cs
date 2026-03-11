using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using DotNetEnv;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using Server.Messages;
using Server.Tokens;

namespace Server;

public class Startup
{
    private readonly ConcurrentDictionary<WebSocket, string> _clients = new();
    private readonly ConcurrentDictionary<string, Token> _tokens = new();

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
    }

    private async Task ProcessMessage(WebSocket socket, string? message)
    {
        if (message == null)
            return;

        dynamic json = JsonConvert.DeserializeObject(message)!;
        if (json.type == "request_create")
        {
            // For now, assume all objects will be circles
            string id = $"object-{Guid.NewGuid()}";
            string color = json.create.color;
            int x = json.create.x;
            int y = json.create.y;
            int r = json.create.r;

            TokenCircle circle = new(id, color, x, y, r);
            CreateResponseMessage create = new(circle);
            _tokens.TryAdd(id, circle);
            await BroadcastMessage(JsonConvert.SerializeObject(create));
        }
        else if (json.type == "request_move")
        {
            string id = json.move.id;
            int x = json.move.x;
            int y = json.move.y;
            if (_tokens.TryGetValue(id, out Token? token))
            {
                if (token is TokenCircle circle)
                {
                    TokenCircle newCircle = new(circle.id, circle.color, x, y, circle.r);
                    _tokens.AddOrUpdate(id, newCircle, (_, _) => newCircle);
                }
                // Unable to match token with any token type, return
                else
                {
                    return;
                }
                MoveResponseMessage move = new(new MoveResponseMessage.Move(id, x, y));
                await BroadcastMessage(JsonConvert.SerializeObject(move));
            }
        }
    }

    private async Task HandleWebSocket(WebSocket socket)
    {
        // Send the history to the socket
        foreach (var token in _tokens.Values)
        {
            CreateResponseMessage create = new(token);
            await SendMessage(socket, JsonConvert.SerializeObject(create));
        }

        var buffer = new byte[1024 * 4];

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
        string? url = Environment.GetEnvironmentVariable("VITE_SERVER_URL");
        if (string.IsNullOrWhiteSpace(url))
            throw new Exception("VITE_SERVER_URL is missing in .env");

        return Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
                webBuilder.UseUrls(url);
            });
    }
}
