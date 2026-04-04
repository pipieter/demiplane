using Demiplane.Model;

namespace Demiplane.Tests;

public class MockBoardState : ConcurrentBoardState
{
    public MockBoardState()
        : base()
    {
        Token[] tokens =
        [
            new TokenCircle("circle-1", "circle-1", "#F00001", null, 10, 10, 10, 10, 10),
            new TokenCircle("circle-2", "circle-2", "#F00002", null, 20, 20, 20, 20, 20),
            new TokenCircle("circle-3", "circle-3", "#F00003", null, 30, 30, 30, 30, 30),
            new TokenCircle("circle-4", "circle-4", "#F00004", null, 40, 40, 40, 40, 40),
            new TokenRectangle("rectangle-1", "rectangle-1", "#00F010", null, 10, 10, 10, 10, 10),
            new TokenRectangle("rectangle-2", "rectangle-2", "#00F020", null, 20, 20, 20, 20, 20),
            new TokenRectangle("rectangle-3", "rectangle-3", "#00F030", null, 30, 30, 30, 30, 30),
            new TokenLine("line-1", "line-1", "#F0F010", 10, 10, 10, 10, 10, 10),
            new TokenLine("line-2", "line-2", "#F0F020", 20, 20, 20, 20, 20, 20),
            new TokenLine("line-3", "line-3", "#F0F030", 30, 30, 30, 30, 30, 30),
            new TokenImage("image-1", "image-1", "/images/image-1.png", 10, 10, 10, 10, 10),
            new TokenImage("image-2", "image-2", "/images/image-2.png", 20, 20, 20, 20, 20),
            new TokenImage("image-3", "image-3", "/images/image-3.png", 30, 30, 30, 30, 30),
        ];

        foreach (Token token in tokens)
        {
            _ = AddToken(token);
        }
    }
}
