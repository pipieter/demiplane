using Demiplane.Messages;
using Demiplane.Model;
using Demiplane.Server;
using Demiplane.Util;
using NUnit.Framework;

namespace Demiplane.Tests;

[TestFixture]
public class ServerConnectionTests : ServerTestSetup
{
    [Test, Timeout(5000)]
    public async Task AbortedConnectionGetsRemoved()
    {
        Socket first = _sockets.First();
        Socket socket = await CreateSocket();

        CreateRequestMessage create1 = new(new TokenCircle("token-1", "token-1", "#FF00FF", null, 10, 10, 10, 10, 10));
        CreateRequestMessage create2 = new(new TokenCircle("token-2", "token-2", "#FF00FF", null, 10, 10, 10, 10, 10));
        CreateRequestMessage create3 = new(new TokenCircle("token-3", "token-3", "#FF00FF", null, 10, 10, 10, 10, 10));

        // Verify that the new socket can send messages
        await socket.SendAsync(Json.Serialize(create1));
        foreach (Socket other in _sockets)
        {
            CreateResponseMessage response = await other.ReceiveAsync<CreateResponseMessage>();
            Assert.That(response.type, Is.EqualTo("create"));
        }

        // Abort the socket and verify that the other sockets work as per normal
        socket.Abort();
        socket.Dispose();
        await first.SendAsync(Json.Serialize(create2));
        foreach (Socket other in _sockets)
        {
            if (other == first)
            {
                continue;
            }

            CreateResponseMessage response = await other.ReceiveAsync<CreateResponseMessage>();
            Assert.That(response.type, Is.EqualTo("create"));
        }
    }
}
