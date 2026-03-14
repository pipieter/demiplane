using System.Drawing;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using NUnit.Framework;
using Server;

namespace Demiplane.Tests;

[TestFixture]
public class ServerTests
{
    private readonly byte[] _buffer = new byte[1024 * 1024 * 10];
    private IHost _server;
    private ClientWebSocket _socket;

    [SetUp]
    public void Setup()
    {
        _server = Program.CreateHostBuilder([]).Build();
        _socket = new ClientWebSocket();
        _server.RunAsync();
    }

    [TearDown]
    public void TearDown()
    {
        _socket.Dispose();
        _server.Dispose();
    }

    [Test]
    public void Test1()
    {
        Assert.Pass();
    }

    [Test]
    public async Task ConnectionToServer_Succeeds()
    {
        await _socket.ConnectAsync(new Uri(Program.WebsocketURL), CancellationToken.None);
        var response = await _socket.ReceiveAsync(_buffer, CancellationToken.None);

        Assert.That(response.Count, Is.GreaterThan(0));

        await _socket.CloseAsync(WebSocketCloseStatus.NormalClosure, null, CancellationToken.None);
    }

    [Test]
    public async Task AddingCircle_Succeeds()
    {
        await _socket.ConnectAsync(new Uri(Program.WebsocketURL), CancellationToken.None);
        await _socket.ReceiveAsync(_buffer, CancellationToken.None); // Receive initial message, and ignore

        var request = (
            type: "request_create",
            create: (type: "circle", color: "#FF0000", x: 200, y: 200, w: 50, h: 50)
        );
        await _socket.SendAsync(
            Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(request)),
            WebSocketMessageType.Text,
            true,
            CancellationToken.None
        );

        var response = await _socket.ReceiveAsync(_buffer, CancellationToken.None);
        string message = Encoding.UTF8.GetString(_buffer, 0, response.Count);

        dynamic? body = JsonConvert.DeserializeObject(message);
        Assert.That(body, Is.Not.Null);
        Assert.That(body.type, Is.EqualTo("create"));

        await _socket.CloseAsync(WebSocketCloseStatus.NormalClosure, null, CancellationToken.None);
    }
}
