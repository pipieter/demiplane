using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using Demiplane.Messages;
using Demiplane.Model;
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
        else if (json.type == "request_transform")
        {
            string id = json.transform.id;
            int x = json.transform.x;
            int y = json.transform.y;
            int w = json.transform.w;
            int h = json.transform.h;
            if (!_state.TransformToken(id, x, y, w, h))
                return;

            TransformResponseMessage size = new(new TransformResponseMessage.Transform(id, x, y, w, h));
            await BroadcastMessage(JsonConvert.SerializeObject(size));
        }
    }
}
