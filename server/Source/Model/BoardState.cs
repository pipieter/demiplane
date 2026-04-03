using Demiplane.Messages;
using Demiplane.Model;

namespace Demiplane;

public class ConcurrentBoardState
{
    private readonly Lock _lock = new();
    private readonly List<Token> _tokens = [];
    private readonly Queue<Token> _deletedTokens = new();
    private const int MaxDeletedTokens = 256;
    private readonly List<User> _users = [];
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

    public Token? DuplicateToken(string parentId, string childId, Point offset)
    {
        lock (_lock)
        {
            Token? parent =
                _tokens.Find(existing => existing.id == parentId)
                ?? _deletedTokens.FirstOrDefault(deleted => deleted.id == parentId);
            if (parent == null)
                return null;

            Token clone = parent.Clone();
            clone.id = childId;
            clone.x += offset.x;
            clone.y += offset.y;

            _tokens.Add(clone);
            return clone;
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
                if (_deletedTokens.Count >= MaxDeletedTokens)
                    _deletedTokens.Dequeue();

                _deletedTokens.Enqueue(token);
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

    public bool AddUser(User user)
    {
        lock (_lock)
        {
            if (_users.Find(existing => existing.id == user.id) != null)
                return false;

            _users.Add(user);
            return true;
        }
    }

    public bool DisconnectUser(string userId)
    {
        lock (_lock)
        {
            User? user = _users.Find(existing => existing.id == userId);
            if (user == null)
                return false;

            // TODO - Currently users are in-memory only, so we just mark them as 'inactive'.
            // Down the line they could be stored externally and maybe fully deleted from the board state (Unless we need user-history of sorts.)
            user.isActive = false;
            return true;
        }
    }

    public User? GetUser(string secret)
    {
        lock (_lock)
        {
            return _users.Find(user => user.secret == secret);
        }
    }

    public User? EditUser(string secret, string name, string color)
    {
        lock (_lock)
        {
            User? user = GetUser(secret);
            if (user == null)
                return null;

            user.isActive = true;
            user.name = name;
            user.color = color;
            return user;
        }
    }

    public List<User> Users()
    {
        lock (_lock)
        {
            return [.. _users];
        }
    }

    public List<User> ActiveUsers()
    {
        lock (_lock)
        {
            return _users.FindAll(user => user.isActive);
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

    public bool TransformToken(string id, string name, int x, int y, int w, int h, int r)
    {
        lock (_lock)
        {
            var token = _tokens.Find(token => token.id == id);
            if (token == null)
                return false;

            token.name = name;
            token.x = x;
            token.y = y;
            token.w = w;
            token.h = h;
            token.r = r;
            return true;
        }
    }

    public bool SetTokenLayer(string id, int layer)
    {
        lock (_lock)
        {
            var token = _tokens.Find(token => token.id == id);
            if (token == null)
                return false;

            layer = Math.Min(layer, 0);
            layer = Math.Max(layer, _tokens.Count - 1);
            int index = _tokens.IndexOf(token);

            _tokens.RemoveAt(index);
            _tokens.Insert(layer, token);
            return true;
        }
    }
}
