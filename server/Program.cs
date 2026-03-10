using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Server;

public class Startup
{
    private readonly ConcurrentDictionary<WebSocket, string> _clients = new();
    private readonly ConcurrentQueue<string> _messages = new();
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

    private async Task HandleWebSocket(WebSocket socket)
    {
        // Stored locally in the thread, in a more robust application
        // this may be stored in a global dictionary.
        int userId = Interlocked.Increment(ref _lastUserId);

        // Send the history to the socket
        foreach (var message in _messages)
        {
            await SendMessage(socket, message);
        }

        // Notify all clients that a new user has joined
        await BroadcastMessage($"User {userId} has joined the chat!");

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
                // Notify all clients that a user has left
                await BroadcastMessage($"User {userId} has left the chat.");
            }
            else
            {
                var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                await BroadcastMessage($"User {userId}: {message}");
            }
        }
    }

    private static async Task SendMessage(WebSocket socket, string message)
    {
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
        _messages.Enqueue(message);

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
