using Demiplane.Util;
using Newtonsoft.Json;

namespace Demiplane.Model;

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
