using Server.Tokens;

namespace Server.Messages;

public record struct CreateResponseMessage(Token create)
{
    public string type = "create";
    public Token create = create;
}

public record struct MoveResponseMessage(MoveResponseMessage.Move move)
{
    public string type = "move";
    public Move move = move;

    public record struct Move(string id, int x, int y)
    {
        public string id = id;
        public int x = x;
        public int y = y;
    }
}

public record struct GridResponseMessage(Grid.Grid grid)
{
    public string type = "grid";
    public Grid.Grid grid = grid;
}
