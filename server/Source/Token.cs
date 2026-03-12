namespace Server.Tokens;

public abstract class Token(string id, int x, int y)
{
    public string id = id;
    public int x = x;
    public int y = y;

    public static Token? Create(dynamic create)
    {
        string id = $"object-{Guid.NewGuid()}";

        if (create.type == "circle")
        {
            string color = create.color;
            int x = create.x;
            int y = create.y;
            int r = create.r;
            return new TokenCircle(id, color, x, y, r);
        }

        if (create.type == "rectangle")
        {
            string color = create.color;
            int x = create.x;
            int y = create.y;
            int w = create.w;
            int h = create.h;
            return new TokenRectangle(id, color, x, y, w, h);
        }

        if (create.type == "image")
        {
            string data = create.data;
            string? href = Util.Image.SaveBase64Image(id, data);
            if (href == null)
                return null;

            int x = create.x;
            int y = create.y;
            int w = create.w;
            int h = create.h;
            return new TokenImage(id, href, x, y, w, h);
        }

        return null;
    }
}

public class TokenCircle(string id, string color, int x, int y, int r) : Token(id, x, y)
{
    public string type = "circle";
    public string color = color;
    public int r = r;
}

public class TokenRectangle(string id, string color, int x, int y, int w, int h) : Token(id, x, y)
{
    public string type = "rectangle";
    public string color = color;
    public int w = w;
    public int h = h;
}

public class TokenImage(string id, string href, int x, int y, int w, int h) : Token(id, x, y)
{
    public string type = "image";
    public string href = href;
    public int w = w;
    public int h = h;
}
