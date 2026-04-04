using Demiplane.Messages;

namespace Demiplane.Server;

public class TimedTokenMessageHistory(long timeoutMs)
{
    private readonly Dictionary<string, Message> _messages = [];
    private readonly Dictionary<string, long> _timestamps = [];
    private readonly long _timeoutMs = timeoutMs;
    private readonly Lock _lock = new();

    private static long Now()
    {
        return DateTime.Now.Ticks / TimeSpan.TicksPerMillisecond;
    }

    public void Add(string token, Message message)
    {
        lock (_lock)
        {
            _messages[token] = message;
            _timestamps[token] = Now();
        }
    }

    public Message? Get(string token)
    {
        lock (_lock)
        {
            if (!_messages.ContainsKey(token))
            {
                return null;
            }

            if (Now() - _timestamps[token] > _timeoutMs)
            {
                _ = _messages.Remove(token);
                _ = _timestamps.Remove(token);
                return null;
            }

            return _messages[token];
        }
    }
}
