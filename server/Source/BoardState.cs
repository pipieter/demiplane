using Server.Tokens;

namespace Server;

public class ConcurrentBoardState
{
    private readonly Lock _lock = new();
    private readonly List<Token> _tokens = [];

    public bool AddToken(Token token)
    {
        lock (_lock)
        {
            _tokens.Add(token);
            return true;
        }
    }

    public bool MoveToken(string id, int x, int y)
    {
        lock (_lock)
        {
            var token = _tokens.Find(token => token.id == id);
            if (token == null)
                return false;

            token.x = x;
            token.y = y;
            return true;
        }
    }

    public List<Token> Tokens()
    {
        lock (_lock)
        {
            return [.. _tokens];
        }
    }
}
