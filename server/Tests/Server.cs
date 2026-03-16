using System.Net.WebSockets;
using System.Text;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using NUnit.Framework;
using NUnit.Framework.Internal;
using Server;

namespace Demiplane.Tests;

[TestFixture]
public class ServerTests
{
    private readonly byte[] _buffer = new byte[1024 * 1024 * 10];
    private IHost _server;
    private ClientWebSocket _socket;

    [OneTimeSetUp]
    public void ServerSetUp()
    {
        _server = Program.CreateHostBuilder([]).Build();
        _ = _server.RunAsync();
    }

    [OneTimeTearDown]
    public void ServerTeardown()
    {
        _server.Dispose();
    }

    [SetUp]
    public async Task Setup()
    {
        _socket = new ClientWebSocket();
        await _socket.ConnectAsync(new Uri(Program.WebsocketURL), CancellationToken.None);
    }

    [TearDown]
    public async Task TearDown()
    {
        await _socket.CloseAsync(WebSocketCloseStatus.NormalClosure, null, CancellationToken.None);
        _socket.Dispose();
    }

    [Test, Timeout(5000)]
    public async Task ConnectionToServer_Succeeds()
    {
        var response = await _socket.ReceiveAsync(_buffer, CancellationToken.None);
        var message = Encoding.UTF8.GetString(_buffer, 0, response.Count);
        dynamic? body = JsonConvert.DeserializeObject(message);

        Assert.That(body, Is.Not.Null);
        Assert.That(body.type.ToString(), Is.EqualTo("sync"));
    }

    [Test, Timeout(5000)]
    public async Task AddingCircle_Succeeds()
    {
        await _socket.ReceiveAsync(_buffer, CancellationToken.None); // Receive initial message, and ignore

        var request =
            @"{
            'type': 'request_create',
            'create': {
                'type': 'circle',
                'color': '#FF0000',
                'x': 200,
                'y': 200,
                'w': 50,
                'h': 50
            }
        }";

        await _socket.SendAsync(
            Encoding.UTF8.GetBytes(request),
            WebSocketMessageType.Text,
            true,
            CancellationToken.None
        );

        var response = await _socket.ReceiveAsync(_buffer, CancellationToken.None);
        var message = Encoding.UTF8.GetString(_buffer, 0, response.Count);
        dynamic? body = JsonConvert.DeserializeObject(message);

        Assert.That(body, Is.Not.Null);
        Assert.That(body.type.ToString(), Is.EqualTo("create"));
        Assert.That(body.create.type.ToString(), Is.EqualTo("circle"));
    }
}
