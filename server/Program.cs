using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;

namespace Server;

public record struct DrawingCircle(string id, string color, int x, int y, int r)
{
    public string type = "circle";
    public string id = id;
    public string color = color;
    public int x = x;
    public int y = y;
    public int r = r;
}

public class DrawingCircleCreation(DrawingCircle circle)
{
    public string type = "create";
    public DrawingCircle create = circle;
}

public class Startup
{
    private readonly ConcurrentDictionary<WebSocket, string> _clients = new();
    private readonly ConcurrentQueue<DrawingCircle> _circles = new();
    private int _lastUserId = 0;

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
            string id = $"object-{Guid.NewGuid().ToString()}";
            string color = json.create.color;
            int x = json.create.x;
            int y = json.create.y;
            int r = json.create.r;

            DrawingCircle circle = new(id, color, x, y, r);
            DrawingCircleCreation creation = new(circle);
            _circles.Enqueue(circle);
            await BroadcastMessage(JsonConvert.SerializeObject(creation));
        }
    }

    private async Task HandleWebSocket(WebSocket socket)
    {
        // Send the history to the socket
        foreach (var circle in _circles)
        {
            DrawingCircleCreation creation = new(circle);
            await SendMessage(socket, JsonConvert.SerializeObject(creation));
        }

        var buffer = new byte[1024 * 4];

        while (socket.State == WebSocketState.Open)
        {
            var result = await socket.ReceiveAsync(
                new ArraySegment<byte>(buffer),
                CancellationToken.None
            );

            if (result.MessageType == WebSocketMessageType.Close)
            {
                // Close the message
                await socket.CloseAsync(
                    WebSocketCloseStatus.NormalClosure,
                    "Closing",
                    CancellationToken.None
                );
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
            await socket.SendAsync(
                segment,
                WebSocketMessageType.Text,
                true,
                CancellationToken.None
            );
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
        CreateHostBuilder(args).Build().Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args)
    {
        return Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
                webBuilder.UseUrls("http://localhost:5000"); // Set your desired port
            });
    }
}
