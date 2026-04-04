using Demiplane.Model;
using NUnit.Framework;

namespace Demiplane.Tests;

[TestFixture]
public class StateTests
{
    protected ConcurrentBoardState _state;

    [SetUp]
    public void Setup()
    {
        _state = new();

        const int tokens = 10;
        for (int i = 0; i < tokens; i++)
        {
            string id = $"id-{i}";
            string color = "#FFFF00";
            int x = i * 10;
            int y = i * 5;
            int w = 10;
            int h = 20;
            int r = i * 30;
            _state.AddToken(new TokenCircle(id, id, color, null, x, y, w, h, r));
        }
    }

    [Test]
    public void MovingTokenLayer_Succeeds()
    {
        List<Token> tokens = _state.Tokens();
        Assert.That(tokens, Is.Not.Empty);

        const int newLayer = 5;
        Token token = tokens[0];
        var success = _state.SetTokenLayer(token.id, newLayer);

        List<Token> newTokens = _state.Tokens();
        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(newTokens.IndexOf(token), Is.EqualTo(newLayer));
        });
    }

    [Test]
    public void MovingNonExistentTokenLayer_Fails()
    {
        List<Token> tokens = _state.Tokens();
        Assert.That(tokens, Is.Not.Empty);

        const string fakeId = "fake-id";
        const int newLayer = 5;
        var success = _state.SetTokenLayer(fakeId, newLayer);

        Assert.That(success, Is.False);
    }

    [Test]
    [TestCase(5, 5)]
    [TestCase(-10, 0)]
    [TestCase(100, 9)] // _state has ten tokens, which gets clamped to length - 1
    public void MovingTokenLayerClamps_Success(int layer, int actual)
    {
        List<Token> tokens = _state.Tokens();
        Assert.That(tokens, Is.Not.Empty);

        Token token = tokens[0];
        var success = _state.SetTokenLayer(token.id, layer);
        List<Token> newTokens = _state.Tokens();

        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(newTokens.IndexOf(token), Is.EqualTo(actual));
        });
    }
}
