using Demiplane.Util;
using Newtonsoft.Json;

namespace Demiplane.Model;

public abstract class TokenCreateBody(int x, int y, int w, int h)
{
    [JsonProperty(Required = Required.Always)]
    public required int x = x;

    [JsonProperty(Required = Required.Always)]
    public required int y = y;

    [JsonProperty(Required = Required.Always)]
    public required int w = w;

    [JsonProperty(Required = Required.Always)]
    public required int h = h;
}

public class TokenCreateCircleBody(string color, int x, int y, int w, int h) : TokenCreateBody(x, y, w, h)
{
    [JsonProperty(Required = Required.Always)]
    public string type = "circle";

    [JsonProperty(Required = Required.Always)]
    public string color = color;
}

public class TokenCreateRectangleBody(string color, int x, int y, int w, int h) : TokenCreateBody(x, y, w, h)
{
    [JsonProperty(Required = Required.Always)]
    public string type = "rectangle";

    [JsonProperty(Required = Required.Always)]
    public string color = color;
}

public class TokenCreateImageBody(string href, int x, int y, int w, int h) : TokenCreateBody(x, y, w, h)
{
    [JsonProperty(Required = Required.Always)]
    public string type = "image";

    [JsonProperty(Required = Required.Always)]
    public string href = href;
}

public abstract class Token(string id, int x, int y, int w, int h)
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

    public static Token? Create(TokenCreateBody create)
    {
        string id = $"object-{Guid.NewGuid()}";
        int x = create.x;
        int y = create.y;
        int w = create.w;
        int h = create.h;

        return create switch
        {
            TokenCreateImageBody image => new TokenImage(id, image.href, x, y, w, h),
            TokenCreateCircleBody circle => new TokenCircle(id, circle.color, x, y, w, h),
            TokenCreateRectangleBody rectangle => new TokenRectangle(id, rectangle.color, x, y, w, h),
            _ => null,
        };
    }
}

public class TokenCircle(string id, string color, int x, int y, int w, int h) : Token(id, x, y, w, h)
{
    [JsonProperty(Required = Required.Always)]
    public string type = "circle";

    [JsonProperty(Required = Required.Always)]
    public string color = color;
}

public class TokenRectangle(string id, string color, int x, int y, int w, int h) : Token(id, x, y, w, h)
{
    [JsonProperty(Required = Required.Always)]
    public string type = "rectangle";

    [JsonProperty(Required = Required.Always)]
    public string color = color;
}

public class TokenImage(string id, string href, int x, int y, int w, int h) : Token(id, x, y, w, h)
{
    [JsonProperty(Required = Required.Always)]
    public string type = "image";

    [JsonProperty(Required = Required.Always)]
    public string href = href;
}

public class TokenCreateBodyJsonConverter : Json.TypeConverter<TokenCreateBody>
{
    public override Dictionary<string, Type> TypeMap
    {
        get =>
            new()
            {
                ["image"] = typeof(TokenCreateImageBody),
                ["circle"] = typeof(TokenCreateCircleBody),
                ["rectangle"] = typeof(TokenCreateRectangleBody),
            };
    }
}

public class TokenJsonConverter : Json.TypeConverter<Token>
{
    public override Dictionary<string, Type> TypeMap
    {
        get =>
            new()
            {
                ["image"] = typeof(TokenImage),
                ["circle"] = typeof(TokenCircle),
                ["rectangle"] = typeof(TokenRectangle),
            };
    }
}
