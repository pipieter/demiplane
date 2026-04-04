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
}
