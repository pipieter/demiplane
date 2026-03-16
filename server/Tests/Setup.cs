using System.Net.WebSockets;

namespace Demiplane.Tests;

/// <summary>
/// Wrapper around ClientWebSocket to make the test code less verbose.
/// </summary>
public class TestSocket : IDisposable
{
    private readonly ClientWebSocket _socket = new();
    private readonly byte[] _buffer = new byte[1024 * 1024 * 10];

    public async Task ConnectAsync(string uri)
    {
        await _socket.ConnectAsync(new Uri(uri), CancellationToken.None);
    }

    public async Task CloseAsync()
    {
        await _socket.CloseAsync(WebSocketCloseStatus.NormalClosure, null, CancellationToken.None);
    }

    public async Task ReceiveAsync()
    {
        await _socket.ReceiveAsync(_buffer, CancellationToken.None);
    }

    public async Task<T> ReceiveAsync<T>()
    {
        var response = await _socket.ReceiveAsync(_buffer, CancellationToken.None);
        var message = System.Text.Encoding.UTF8.GetString(_buffer, 0, response.Count);
        T body =
            Server.Util.Json.Deserialize<T>(message)
            ?? throw new Exception($"Could not parse {typeof(T).Name} from '{message}'");
        return body;
    }

    public async Task SendAsync(string message)
    {
        await _socket.SendAsync(
            System.Text.Encoding.UTF8.GetBytes(message),
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
