using System.Net.WebSockets;
using Microsoft.Extensions.Hosting;
using NUnit.Framework;

namespace Demiplane.Tests;

public class ServerTestSetup
{
    protected IHost _server;
    protected Server.Socket _socket;

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
        ClientWebSocket socket = new();
        await socket.ConnectAsync(new Uri(Program.WebsocketURL), CancellationToken.None);
        _socket = new(socket);
    }

    [TearDown]
    public async Task TearDown()
    {
        await _socket.CloseAsync();
        _socket.Dispose();
    }
}
