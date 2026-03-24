using System.Collections.Concurrent;
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

        // Synchronize the current state
        User newUser = GenerateNewUser();
        SyncResponseMessage sync = new([.. _state.Tokens()], _state.GetBackground(), _state.GetGrid(), [.. _state.Users()], newUser);
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

    private User GenerateNewUser()
    {
        // TODO - This probably does not belong in this file and should be moved.
        // TODO only create a user if synced device does not send an existing bearer token.
        Guid guid = Guid.NewGuid();
        string newUserName = "Wanderer " + _state.Users().Count;

        // bearer
        byte[] tokenBytes = RandomNumberGenerator.GetBytes(32);
        string bearer = Convert.ToHexString(tokenBytes);

        // color
        byte[] bytes = guid.ToByteArray();
        byte r = (byte)(bytes[0] % 200 + 30);
        byte g = (byte)(bytes[1] % 200 + 30);
        byte b = (byte)(bytes[2] % 200 + 30);
        string newUserColor = $"#{r:X2}{g:X2}{b:X2}";

        return new(guid.ToString(), bearer, newUserName, newUserColor);
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
                    if (!_state.AddToken(create.create))
                        throw new Exception("Could not add token.");

                    CreateResponseMessage response = new(create.create);
                    await BroadcastMessage(JsonConvert.SerializeObject(response));
                    break;
                }

            case DeleteRequestMessage delete:
                {
                    if (!_state.DeleteTokens(delete.delete))
                        throw new Exception("Could not delete tokens.");

                    var response = new DeleteResponseMessage(delete.delete);
                    await BroadcastMessage(JsonConvert.SerializeObject(response));
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
                    int r = transform.transform.r;
                    if (!_state.TransformToken(id, x, y, w, h, r))
                        throw new Exception("Could not transform token.");

                    TransformResponseMessage response = new(new Transform(id, x, y, w, h, r));
                    await BroadcastMessage(JsonConvert.SerializeObject(response));
                    break;
                }

            case GridRequestMessage grid:
                {
                    if (!_state.SetGrid(grid.grid.size, grid.grid.offset.x, grid.grid.offset.y))
                        throw new Exception("Could not set grid.");

                    GridResponseMessage response = new(_state.GetGrid());
                    await BroadcastMessage(JsonConvert.SerializeObject(response));
                    break;
                }
        }
    }
}
