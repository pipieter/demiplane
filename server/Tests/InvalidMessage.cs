using Demiplane.Messages;
using NUnit.Framework;
using NUnit.Framework.Internal;

namespace Demiplane.Tests;

/// <summary>
/// This is a test suite to test invalid websocket messages. These messages can be missing fields, using the wrong field
/// types, using too many fields... In these scenarios, a response should be returned with type "error".
/// </summary>
[TestFixture]
public class InvalidMessageTests : ServerTestSetup
{
    private static readonly string[] NonJSONMessages =
    [
        "",
        "invalid_message",
        "<message><type>create</type></message>",
        "{'type': 'request_delete', 'delete': []", // This message contains an unclosed '}'
    ];

    private static readonly string[] MissingFieldsMessages =
    [
        "{'type': 'request_create', 'create': {'type': 'circle', 'id': '123', 'border': null,'color': '#FF0000', 'x': 200, 'h': 200, 'r': 0}}",
        "{'type': 'request_delete'}",
    ];

    private static readonly string[] InvalidFieldMessages =
    [
        "{'type': 'request_create', 'create': {'type': 'circle', 'id': '123', 'border': 5 'color': '#FF0000', 'x': 'x-value', 'y': 'y-value', 'w': 200, 'h': 200, 'r': 0}}",
        "{'type': 'request_delete', 'delete': [1, 2, 3]}",
    ];

    private static readonly string[] TooManyFieldsMessage =
    [
        "{'type': 'request_delete', 'delete': [], 'note': 'Delete these ASAP'}",
    ];

    [Test, Timeout(5000)]
    [TestCaseSource(nameof(NonJSONMessages))]
    [TestCaseSource(nameof(MissingFieldsMessages))]
    [TestCaseSource(nameof(InvalidFieldMessages))]
    [TestCaseSource(nameof(TooManyFieldsMessage))]
    public async Task InvalidMessage_Fails(string request)
    {
        await _socket.SendAsync(request);

        var response = await _socket.ReceiveAsync<ErrorResponseMessage>();
        Assert.That(response.type, Is.EqualTo("error"));
    }
}
