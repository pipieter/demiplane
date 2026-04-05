using Demiplane.Model;
using NUnit.Framework;

namespace Demiplane.Tests;

[TestFixture]
public class BoardStateTests
{
    [Test]
    public void AddTokenAndRemoveSucceeds()
    {
        MockBoardState state = new();

        string id = "new-token";
        int count = state.Tokens().Count;
        Token token = new TokenCircle(id, id, "#FFFFFF", null, 20, 20, 20, 20, 20);

        // Add token
        Assert.Multiple(() =>
        {
            Assert.That(state.AddToken(token), Is.True);
            Assert.That(state.Tokens(), Has.Count.EqualTo(count + 1));
            Assert.That(state.Tokens(), Contains.Item(token));
        });

        // Remove token
        Assert.Multiple(() =>
        {
            Assert.That(state.DeleteTokens([token.id]), Is.True);
            Assert.That(state.Tokens(), Has.Count.EqualTo(count));
            Assert.That(state.Tokens(), !Contains.Item(token));
        });
    }

    [Test]
    public void AddingExistingTokensFails()
    {
        MockBoardState state = new();
        Token existing = state.Tokens().First();
        Token token = existing.Clone();

        Assert.That(state.AddToken(token), Is.False);
    }

    [Test]
    public void RemovingNonExistingTokenFails()
    {
        MockBoardState state = new();
        string id = "non-existing";

        Assert.That(state.DeleteTokens([id]), Is.False);
    }

    [Test]
    public void DuplicateExistingTokenSucceeds()
    {
        MockBoardState state = new();

        string childId = "child";
        Token parent = state.Tokens().First();

        Assert.That(state.DuplicateToken(parent.id, childId, new(10, 10)), !Is.Null);
    }

    [Test]
    public void DuplicateDeletedTokenSucceeds()
    {
        MockBoardState state = new();

        string childId = "child";
        Token parent = state.Tokens().First();

        Assert.Multiple(() =>
        {
            Assert.That(state.DeleteTokens([parent.id]), Is.True);
            Assert.That(state.DuplicateToken(parent.id, childId, new(10, 10)), !Is.Null);
        });
    }

    [Test]
    public void DuplicateNonExistingTokenFails()
    {
        MockBoardState state = new();
        string nonExistingParentId = "non-existing";
        string id = "token";

        Assert.That(state.DuplicateToken(nonExistingParentId, id, new(10, 10)), Is.Null);
    }

    [Test]
    public void MovingTokenLayerSucceeds()
    {
        MockBoardState state = new();

        const int newLayer = 5;
        Token token = state.Tokens().First();
        bool success = state.SetTokenLayer(token.id, newLayer);

        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(state.Tokens().IndexOf(token), Is.EqualTo(newLayer));
        });
    }

    [Test]
    public void MovingNonExistentTokenLayerFails()
    {
        MockBoardState state = new();
        Assert.That(state.Tokens(), Is.Not.Empty);

        const string fakeId = "fake-id";
        const int newLayer = 5;
        bool success = state.SetTokenLayer(fakeId, newLayer);

        Assert.That(success, Is.False);
    }

    [Test]
    [TestCase(5, 5)]
    [TestCase(-10, 0)]
    [TestCase(100, 12)] // _state has thirteen tokens, which gets clamped to length - 1
    public void MovingTokenLayerClampsSuccess(int layer, int actual)
    {
        MockBoardState state = new();
        Assert.That(state.Tokens(), Is.Not.Empty);

        Token token = state.Tokens().First();
        bool success = state.SetTokenLayer(token.id, layer);

        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(state.Tokens().IndexOf(token), Is.EqualTo(actual));
        });
    }
}
