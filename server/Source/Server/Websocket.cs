using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using Demiplane.Messages;
using Demiplane.Model;
using Demiplane.Util;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace Demiplane.Server;

public class Socket(WebSocket socket)
{
    private readonly WebSocket _socket = socket;
    private readonly byte[] _buffer = new byte[1024 * 1024 * 100];
    public bool IsOpen => _socket.State == WebSocketState.Open;
    public bool WantsToClose { get; private set; }

    public async Task CloseAsync()
    {
        await _socket.CloseAsync(WebSocketCloseStatus.NormalClosure, null, CancellationToken.None);
    }

    public async Task<string> ReceiveAsync()
    {
        var response = await _socket.ReceiveAsync(_buffer, CancellationToken.None);
        if (response.MessageType == WebSocketMessageType.Close)
            WantsToClose = true;

        var message = Encoding.UTF8.GetString(_buffer, 0, response.Count);
        return message;
    }

    public async Task<T> ReceiveAsync<T>()
    {
        string message = await ReceiveAsync();
        T body =
            Json.Deserialize<T>(message) ?? throw new Exception($"Could not parse {typeof(T).Name} from '{message}'");
        return body;
    }

    public async Task SendAsync(string message)
    {
        await _socket.SendAsync(
            Encoding.UTF8.GetBytes(message),
            WebSocketMessageType.Text,
            true,
            CancellationToken.None
        );
    }

    public void Dispose()
    {
        _socket.Dispose();
    }
}

public partial class Server
{
    private readonly ConcurrentDictionary<Socket, string> _clients = new();

    private async Task HandleWebSocket(HttpContext context)
    {
        WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
        Socket socket = new(webSocket);
        _clients.TryAdd(socket, "");

        // Synchronize the current state
        SyncResponseMessage sync = new([.. _state.Tokens()], _state.GetBackground(), _state.GetGrid());
        await socket.SendAsync(Json.Serialize(sync));

        while (socket.IsOpen)
        {
            string message = await socket.ReceiveAsync();
            if (socket.WantsToClose)
            {
                _clients.TryRemove(socket, out _);
                await socket.CloseAsync();
                socket.Dispose();
                return;
            }
            else
            {
                try
                {
                    await ProcessMessage(socket, message);
                }
                catch (Exception exc)
                {
                    await socket.SendAsync($"{{\"type\": \"error\", \"message\": \"{exc.Message}\"}}");
                }
            }
        }
    }

    private async Task BroadcastMessage(string message)
    {
        foreach (var client in _clients.Keys)
        {
            await client.SendAsync(message);
        }
    }

    private async Task ProcessMessage(Socket socket, string? message)
    {
        if (message == null)
            return;

        Message? body = Json.Deserialize<Message>(message);

        switch (body)
        {
            case CreateRequestMessage create:
                {
                    Token token = Token.Create(create.create) ?? throw new Exception("Could not create token.");

                    if (!_state.AddToken(token))
                        throw new Exception("Could not add token.");

                    CreateResponseMessage response = new(token);
                    await BroadcastMessage(JsonConvert.SerializeObject(response));
                    break;
                }

            case BackgroundRequestMessage background:
                {
                    string href = background.href;
                    Background found = Background.FindFromHref(href) ?? throw new Exception("Resource not found.");

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
                        throw new Exception("Could not transform token.");

                    TransformResponseMessage size = new(new Transform(id, x, y, w, h));
                    await BroadcastMessage(JsonConvert.SerializeObject(size));
                    break;
                }
        }
    }
}
