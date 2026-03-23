using Demiplane.Messages;
using Demiplane.Model;
using NUnit.Framework;
using NUnit.Framework.Internal;

namespace Demiplane.Tests;

[TestFixture]
public class ServerTests : ServerTestSetup
{
    [Test, Timeout(5000)]
    public async Task ConnectionToServer_Succeeds()
    {
        var response = await _socket.ReceiveAsync<SyncResponseMessage>();

        Assert.That(response.type, Is.EqualTo("sync"));
    }

    [Test, Timeout(5000)]
    public async Task AddingCircle_Succeeds()
    {
        await _socket.ReceiveAsync(); // Receive initial message, and ignore

        var request =
            @"{
            'type': 'request_create',
            'create': {
                'type': 'circle',
                'id': '123',
                'color': '#FF0000',
                'border': 4,
                'x': 200,
                'y': 200,
                'w': 50,
                'h': 50
            }
        }";

        await _socket.SendAsync(request);
        var response = await _socket.ReceiveAsync<CreateResponseMessage>();

        Assert.Multiple(() =>
        {
            Assert.That(response.type, Is.EqualTo("create"));
            Assert.That(response.create, Is.InstanceOf<TokenCircle>());
        });

        TokenCircle circle = (TokenCircle)response.create;
        Assert.Multiple(() =>
        {
            Assert.That(circle.type, Is.EqualTo("circle"));
            Assert.That(circle.x, Is.EqualTo(200));
            Assert.That(circle.y, Is.EqualTo(200));
            Assert.That(circle.w, Is.EqualTo(50));
            Assert.That(circle.h, Is.EqualTo(50));
        });
    }
}
