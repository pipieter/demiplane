using Demiplane.Model;
using Demiplane.Util;
using Newtonsoft.Json;

namespace Demiplane.Messages;

public abstract class Message { }

public class ErrorResponseMessage(string message)
{
    [JsonProperty(Required = Required.Always)]
    public string type = "error";

    [JsonProperty(Required = Required.Always)]
    public string message = message;
}

public class SyncResponseMessage(Token[] tokens, Background background, Grid grid, User[] users, User me) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "sync";

    [JsonProperty(Required = Required.Always)]
    public Token[] tokens = tokens;

    [JsonProperty(Required = Required.Always)]
    public Background background = background;

    [JsonProperty(Required = Required.Always)]
    public Grid grid = grid;
    [JsonProperty(Required = Required.Always)]
    public User[] users = users;
    [JsonProperty(Required = Required.Always)]
    public string bearer = me.bearer;
    [JsonProperty(Required = Required.Always)]
    public User me = me;
}

public class CreateRequestMessage(Token create) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "request_create";

    [JsonProperty(Required = Required.Always)]
    public Token create = create;
}

public class CreateResponseMessage(Token create) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "create";

    [JsonProperty(Required = Required.Always)]
    public Token create = create;
}

public class DeleteRequestMessage(List<string> delete) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "request_delete";

    [JsonProperty(Required = Required.Always)]
    public List<string> delete = delete;
}

public class DeleteResponseMessage(List<string> delete) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "delete";

    [JsonProperty(Required = Required.Always)]
    public List<string> delete = delete;
}

public class GridRequestMessage(Grid grid) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "request_grid";

    [JsonProperty(Required = Required.Always)]
    public Grid grid = grid;
}

public class GridResponseMessage(Grid grid) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "grid";

    [JsonProperty(Required = Required.Always)]
    public Grid grid = grid;
}

public class BackgroundRequestMessage(string href) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "request_background";

    [JsonProperty(Required = Required.Always)]
    public string href = href;
}

public class BackgroundResponseMessage(Background background) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "background";

    [JsonProperty(Required = Required.Always)]
    public Background background = background;
}

public record struct Transform(string id, int x, int y, int w, int h, int r)
{
    [JsonProperty(Required = Required.Always)]
    public string id = id;

    [JsonProperty(Required = Required.Always)]
    public int x = x;

    [JsonProperty(Required = Required.Always)]
    public int y = y;

    [JsonProperty(Required = Required.Always)]
    public int w = w;

    [JsonProperty(Required = Required.Always)]
    public int h = h;
    [JsonProperty(Required = Required.Always)]
    public int r = r;
}

public class TransformRequestMessage(Transform transform) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "request_transform";

    [JsonProperty(Required = Required.Always)]
    public Transform transform = transform;
}

public class TransformResponseMessage(Transform transform) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "transform";

    [JsonProperty(Required = Required.Always)]
    public Transform transform = transform;
}

public record struct RequestUser(string bearer, string name, string color)
{
    [JsonProperty(Required = Required.Always)]
    public string bearer = bearer;

    [JsonProperty(Required = Required.Always)]
    public string name = name;

    [JsonProperty(Required = Required.Always)]
    public string color = color;
}

public class UserRequestMessage(RequestUser user) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "request_user";

    [JsonProperty(Required = Required.Always)]
    public RequestUser user = user;
}

public class UserResponseMessage(User user) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "user";

    [JsonProperty(Required = Required.Always)]
    public User user = user;
}

public class MessageJsonConverter : Json.TypeConverter<Message>
{
    public override Dictionary<string, Type> TypeMap
    {
        get =>
            new()
            {
                ["error"] = typeof(ErrorResponseMessage),
                ["sync"] = typeof(SyncResponseMessage),
                ["grid"] = typeof(GridResponseMessage),
                ["create"] = typeof(CreateResponseMessage),
                ["delete"] = typeof(DeleteResponseMessage),
                ["transform"] = typeof(TransformResponseMessage),
                ["background"] = typeof(BackgroundResponseMessage),
                ["user"] = typeof(UserResponseMessage),
                ["request_grid"] = typeof(GridRequestMessage),
                ["request_create"] = typeof(CreateRequestMessage),
                ["request_delete"] = typeof(DeleteRequestMessage),
                ["request_transform"] = typeof(TransformRequestMessage),
                ["request_background"] = typeof(BackgroundRequestMessage),
                ["request_user"] = typeof(UserRequestMessage),
            };
    }
}
