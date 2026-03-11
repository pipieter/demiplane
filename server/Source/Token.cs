namespace Server.Tokens;

public abstract class Token(string id, int x, int y)
{
    public string id = id;
    public int x = x;
    public int y = y;
}

public class TokenCircle(string id, string color, int x, int y, int r) : Token(id, x, y)
{
    public string type = "circle";
    public string color = color;
    public int r = r;
}
