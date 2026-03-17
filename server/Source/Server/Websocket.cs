using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using Demiplane.Messages;
using Demiplane.Model;
using Demiplane.Util;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace Demiplane.Server;

public partial class Server
{
    private readonly ConcurrentDictionary<WebSocket, string> _clients = new();

    private async Task HandleWebSocket(HttpContext context)
    {
        WebSocket socket = await context.WebSockets.AcceptWebSocketAsync();
        _clients.TryAdd(socket, "");

        // Synchronize the current state
        SyncResponseMessage sync = new([.. _state.Tokens()], _state.GetBackground(), _state.GetGrid());
        await SendMessage(socket, JsonConvert.SerializeObject(sync));

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
        var buffer = System.Text.Encoding.UTF8.GetBytes(message);
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

    private async Task ProcessMessage(WebSocket socket, string? message)
    {
        if (message == null)
            return;

        Message? body = Json.Deserialize<Message>(message);

        switch (body)
        {
            case CreateRequestMessage create:
            {
                Token? token = Token.Create(create.create);
                if (token == null)
                    return;

                if (!_state.AddToken(token))
                    return;

                CreateResponseMessage response = new(token);
                await BroadcastMessage(JsonConvert.SerializeObject(response));
                break;
            }

            case BackgroundRequestMessage background:
            {
                string href = background.href;
                Background? found = Background.FindFromHref(href);
                if (found == null)
                    return;

                _state.SetBackground(found);
                BackgroundResponseMessage response = new(_state.GetBackground());
                await BroadcastMessage(JsonConvert.SerializeObject(response));
                break;
            }

            case TransformRequestMessage transform:
            {
                string id = transform.transform.id;
                int x = transform.transform.x;
                int y = transform.transform.y;
                int w = transform.transform.w;
                int h = transform.transform.h;
                if (!_state.TransformToken(id, x, y, w, h))
                    return;

                TransformResponseMessage size = new(new Transform(id, x, y, w, h));
                await BroadcastMessage(JsonConvert.SerializeObject(size));
                break;
            }
        }
    }
}
