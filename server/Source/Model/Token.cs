using Demiplane.Util;
using Newtonsoft.Json;

namespace Demiplane.Model;

public abstract class Token(string id, int x, int y, int w, int h, int r)
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

public class TokenCircle(string id, string color, int? border, int x, int y, int w, int h, int r) : Token(id, x, y, w, h, r)
{
    [JsonProperty(Required = Required.Always)]
    public string type = "circle";

    [JsonProperty(Required = Required.Always)]
    public string color = color;

    [JsonProperty(Required = Required.AllowNull)]
    public int? border = border;
}

public class TokenRectangle(string id, string color, int? border, int x, int y, int w, int h, int r) : Token(id, x, y, w, h, r)
{
    [JsonProperty(Required = Required.Always)]
    public string type = "rectangle";

    [JsonProperty(Required = Required.Always)]
    public string color = color;

    [JsonProperty(Required = Required.AllowNull)]
    public int? border = border;
}

public class TokenLine(string id, string color, int stroke, int x, int y, int w, int h, int r) : Token(id, x, y, w, h, r)
{
    [JsonProperty(Required = Required.Always)]
    public string type = "line";

    [JsonProperty(Required = Required.Always)]
    public string color = color;

    [JsonProperty(Required = Required.AllowNull)]
    public int stroke = stroke;
}

public class TokenImage(string id, string href, int x, int y, int w, int h, int r) : Token(id, x, y, w, h, r)
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
                ["line"] = typeof(TokenLine),
            };
    }
}
