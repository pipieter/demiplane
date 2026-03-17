using Demiplane.Model;
using Demiplane.Util;

namespace Demiplane.Messages;

public abstract class Message { }

public class SyncResponseMessage(Token[] tokens, Background background, Grid grid) : Message
{
    public string type = "sync";
    public Token[] tokens = tokens;
    public Background background = background;
    public Grid grid = grid;
}

public class CreateRequestMessage(TokenCreateBody create) : Message
{
    public string type = "request_create";
    public TokenCreateBody create = create;
}

public class CreateResponseMessage(Token create) : Message
{
    public string type = "create";
    public Token create = create;
}

public class GridRequestMessage(Grid grid) : Message
{
    public string type = "request_grid";
    public Grid grid = grid;
}

public class GridResponseMessage(Grid grid) : Message
{
    public string type = "grid";
    public Grid grid = grid;
}

public class BackgroundRequestMessage(string href) : Message
{
    public string type = "request_background";
    public string href = href;
}

public class BackgroundResponseMessage(Background background) : Message
{
    public string type = "background";
    public Background background = background;
}

public record struct Transform(string id, int x, int y, int w, int h)
{
    public string id = id;
    public int x = x;
    public int y = y;
    public int w = w;
    public int h = h;
}

public class TransformRequestMessage(Transform transform) : Message
{
    public string type = "request_transform";
    public Transform transform = transform;
}

public class TransformResponseMessage(Transform transform) : Message
{
    public string type = "transform";
    public Transform transform = transform;
}

public class MessageJsonConverter : Json.TypeConverter<Message>
{
    public override Dictionary<string, Type> TypeMap
    {
        get =>
            new()
            {
                ["sync"] = typeof(SyncResponseMessage),
                ["grid"] = typeof(GridResponseMessage),
                ["create"] = typeof(CreateResponseMessage),
                ["transform"] = typeof(TransformResponseMessage),
                ["background"] = typeof(BackgroundResponseMessage),
                ["request_grid"] = typeof(GridRequestMessage),
                ["request_create"] = typeof(CreateRequestMessage),
                ["request_transform"] = typeof(TransformRequestMessage),
                ["request_background"] = typeof(BackgroundRequestMessage),
            };
    }
}
