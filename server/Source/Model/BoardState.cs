using Demiplane.Model;

namespace Demiplane;

public class ConcurrentBoardState
{
    private readonly Lock _lock = new();
    private readonly List<Token> _tokens = [];
    private readonly Grid _grid = new(64, 0, 0);
    private readonly Background _background = new(null, 1024, 1024);

    public bool AddToken(Token token)
    {
        lock (_lock)
        {
            if (_tokens.Find(existing => existing.id == token.id) != null)
                return false;

            _tokens.Add(token);
            return true;
        }
    }

    public bool DeleteTokens(List<string> ids)
    {
        lock (_lock)
        {
            List<Token> tokensToRemove = [.. _tokens.Where(token => ids.Contains(token.id))];
            if (tokensToRemove.Count != ids.Count)
                return false;

            foreach (Token token in tokensToRemove)
            {
                _tokens.Remove(token);
            }
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

    public bool SetGrid(int size, int offsetX, int offsetY)
    {
        lock (_lock)
        {
            _grid.size = size;
            _grid.offset.x = offsetX;
            _grid.offset.y = offsetY;
            return true;
        }
    }

    public Grid GetGrid()
    {
        lock (_lock)
        {
            return _grid.Clone();
        }
    }

    public void SetBackground(Background background)
    {
        lock (_lock)
        {
            _background.href = background.href;
            _background.width = background.width;
            _background.height = background.height;
        }
    }

    public Background GetBackground()
    {
        lock (_lock)
        {
            return _background.Clone();
        }
    }

    public bool TransformToken(string id, int x, int y, int w, int h, int r)
    {
        lock (_lock)
        {
            var token = _tokens.Find(token => token.id == id);
            if (token == null)
                return false;

            token.x = x;
            token.y = y;
            token.w = w;
            token.h = h;
            token.r = r;
            return true;
        }
    }
}
