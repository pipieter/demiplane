using Demiplane.Util;

namespace Demiplane.Model;

public abstract class TokenCreateBody(int x, int y, int w, int h)
{
    public int x = x;
    public int y = y;
    public int w = w;
    public int h = h;
}

public class TokenCreateCircleBody(string color, int x, int y, int w, int h) : TokenCreateBody(x, y, w, h)
{
    public string type = "circle";
    public string color = color;
}

public class TokenCreateRectangleBody(string color, int x, int y, int w, int h) : TokenCreateBody(x, y, w, h)
{
    public string type = "rectangle";
    public string color = color;
}

public class TokenCreateImageBody(string href, int x, int y, int w, int h) : TokenCreateBody(x, y, w, h)
{
    public string type = "image";
    public string href = href;
}

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
