using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Server.Tokens;

public abstract class Token(string id, int x, int y, int w, int h)
{
    public string id = id;
    public int x = x;
    public int y = y;
    public int w = w;
    public int h = h;

    public static Token? Create(dynamic create)
    {
        string id = $"object-{Guid.NewGuid()}";
        int x = create.x;
        int y = create.y;
        int w = create.w;
        int h = create.h;

        if (create.type == "circle")
        {
            string color = create.color;

            return new TokenCircle(id, color, x, y, w, h);
        }

        if (create.type == "rectangle")
        {
            string color = create.color;
            return new TokenRectangle(id, color, x, y, w, h);
        }

        if (create.type == "image")
        {
            string href = create.href;
            return new TokenImage(id, href, x, y, w, h);
        }

        return null;
    }
}

public class TokenCircle(string id, string color, int x, int y, int w, int h) : Token(id, x, y, w, h)
{
    public string type = "circle";
    public string color = color;
}

public class TokenRectangle(string id, string color, int x, int y, int w, int h) : Token(id, x, y, w, h)
{
    public string type = "rectangle";
    public string color = color;
}

public class TokenImage(string id, string href, int x, int y, int w, int h) : Token(id, x, y, w, h)
{
    public string type = "image";
    public string href = href;
}

public class TokenJsonConverter : JsonConverter
{
    public override bool CanConvert(Type objectType)
    {
        return objectType == typeof(Token);
    }

    public override object? ReadJson(
        JsonReader reader,
        Type objectType,
        object? existingValue,
        JsonSerializer serializer
    )
    {
        JObject? obj = JObject.Load(reader);

        if (obj == null)
            return null;

        return obj["type"]?.Value<string>() switch
        {
            "image" => obj.ToObject<TokenImage>(),
            "circle" => obj.ToObject<TokenCircle>(),
            "rectangle" => obj.ToObject<TokenRectangle>(),
            _ => null,
        };
    }

    public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer)
    {
        throw new NotImplementedException();
    }
}
