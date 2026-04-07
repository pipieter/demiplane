using System.Net.WebSockets;
using Demiplane.Server;
using Microsoft.Extensions.Hosting;
using NUnit.Framework;

namespace Demiplane.Tests;

public class ServerTestSetup
{
    protected IHost _server;
    protected Socket[] _sockets;

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

    private static async Task<Socket> CreateSocket()
    {
        ClientWebSocket socket = new();
        await socket.ConnectAsync(new Uri(Program.WebsocketURL), CancellationToken.None);
        return new(socket);
    }

    [SetUp]
    public async Task Setup()
    {
        _sockets = [await CreateSocket(), await CreateSocket(), await CreateSocket(), await CreateSocket()];
    }

    [TearDown]
    public async Task TearDown()
    {
        foreach (Socket socket in _sockets)
        {
            await socket.CloseAsync();
            socket.Dispose();
        }
    }
}
