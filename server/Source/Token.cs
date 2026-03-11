namespace Server.Tokens;

public abstract class Token(string id)
{
    public string id = id;
}

public class TokenCircle(string id, string color, int x, int y, int r) : Token(id)
{
    public string type = "circle";
    public string color = color;
    public int x = x;
    public int y = y;
    public int r = r;
}
