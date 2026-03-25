using System.Collections.Concurrent;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Security.Cryptography;
using System.Text;
using Demiplane.Messages;
using Demiplane.Model;
using Demiplane.Services;
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

        while (socket.IsOpen)
        {
            string message = await socket.ReceiveAsync();
            if (socket.WantsToClose)
            {
                string userId = _clients[socket];
                UserDisconnectResponseMessage response = new(userId);
                _state.DisconnectUser(userId);
                _clients.TryRemove(socket, out _);
                await socket.CloseAsync();
                socket.Dispose();
                await BroadcastMessage(response, socket);
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

    private async Task BroadcastMessage(Message message, Socket? ignoreSocket = null)
    {
        foreach (Socket client in _clients.Keys)
        {
            if (client == ignoreSocket)
                continue;
            await client.SendAsync(JsonConvert.SerializeObject(message));
        }
    }

    private async Task ProcessMessage(Socket socket, string? message)
    {
        if (message == null)
            return;

        Message? body = Json.Deserialize<Message>(message);

        switch (body)
        {
            case SyncRequestMessage sync:
            {
                string? secret = sync.secret;
                User? user = null;

                if (secret != null)
                {
                    user = _state.GetUser(secret);
                    if (user == null)
                        secret = null; // Forces creation of a new user.
                }

                if (secret == null)
                {
                    user = UserService.GenerateUser(_state.Users());
                    if (!_state.AddUser(user))
                        throw new Exception("Could not register user.");
                }

                if (user == null)
                    throw new Exception("Failed to validate user.");

                _clients.AddOrUpdate(socket, user.id, (key, oldValue) => user.id);
                SyncResponseMessage syncResponse = new(
                    [.. _state.Tokens()],
                    _state.GetBackground(),
                    _state.GetGrid(),
                    [.. _state.ActiveUsers()],
                    user
                );
                await socket.SendAsync(Json.Serialize(syncResponse));

                UserChangeResponseMessage userResponse = new(user);
                // Note: we also respond to the socket we communicate with
                await BroadcastMessage(userResponse);
                break;
            }

            case CreateRequestMessage create:
            {
                if (!_state.AddToken(create.create))
                    throw new Exception("Could not add token.");

                CreateResponseMessage response = new(create.create);
                await BroadcastMessage(response, socket);
                break;
            }

            case DeleteRequestMessage delete:
            {
                if (!_state.DeleteTokens(delete.delete))
                    throw new Exception("Could not delete tokens.");

                var response = new DeleteResponseMessage(delete.delete);
                await BroadcastMessage(response, socket);
                break;
            }

            case BackgroundRequestMessage background:
            {
                Asset asset =
                    _assetService.Find(background.href)
                    ?? throw new FileNotFoundException($"Could not find {background.href}");

                if (!Image.IsImage(asset.Path))
                    throw new FormatException($"File at {background.href} is not an image!");

                (int width, int height) = Image.GetSize(asset.Path);
                Background found = new(background.href, width, height);

                _state.SetBackground(found);
                BackgroundResponseMessage response = new(_state.GetBackground());
                await BroadcastMessage(response, socket);
                break;
            }

            case TransformRequestMessage transform:
            {
                string id = transform.transform.id;
                int x = transform.transform.x;
                int y = transform.transform.y;
                int w = transform.transform.w;
                int h = transform.transform.h;
                int r = transform.transform.r;
                if (!_state.TransformToken(id, x, y, w, h, r))
                    throw new Exception("Could not transform token.");

                TransformResponseMessage response = new(new Transform(id, x, y, w, h, r));
                await BroadcastMessage(response, socket);
                break;
            }

            case GridRequestMessage grid:
            {
                if (!_state.SetGrid(grid.grid.size, grid.grid.offset.x, grid.grid.offset.y))
                    throw new Exception("Could not set grid.");

                GridResponseMessage response = new(_state.GetGrid());
                await BroadcastMessage(response, socket);
                break;
            }

            case UserChangeRequestMessage user:
            {
                User userData =
                    _state.EditUser(user.user.secret, user.user.name, user.user.color)
                    ?? throw new Exception("Could not find user.");
                UserChangeResponseMessage response = new(userData);
                // Note: we also respond to the socket we communicate with
                await BroadcastMessage(response);
                break;
            }
        }
    }
}
