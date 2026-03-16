using Server.Tokens;

namespace Server.Messages;

public record struct SyncResponseMessage(Token[] tokens, Background background, Grid.Grid grid)
{
    public string type = "sync";
    public Token[] tokens = tokens;
    public Background background = background;
    public Grid.Grid grid = grid;
}

public record struct CreateResponseMessage(Token create)
{
    public string type = "create";
    public Token create = create;
}

public record struct GridResponseMessage(Grid.Grid grid)
{
    public string type = "grid";
    public Grid.Grid grid = grid;
}

public record struct BackgroundResponseMessage(Background background)
{
    public string type = "background";
    public Background background = background;
}

public record struct TransformResponseMessage(TransformResponseMessage.Transform transform)
{
    public string type = "transform";
    public Transform transform = transform;

    public record struct Transform(string id, int x, int y, int w, int h)
    {
        public string id = id;
        public int x = x;
        public int y = y;
        public int w = w;
        public int h = h;
    }
}
