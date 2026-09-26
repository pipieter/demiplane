namespace Demiplane.Util;

public class TimedBag<TKey, TValue>(long timeoutMs) where TKey : notnull
{
    internal readonly record struct TimedQueueEntry(TValue value, long timestamp)
    {
        public readonly TValue value = value;
        public readonly long timestamp = timestamp;
    }

    private readonly Dictionary<TKey, List<TimedQueueEntry>> _entries = [];
    private readonly long _timeoutMs = timeoutMs;
    private readonly Lock _lock = new();

    private static long Now()
    {
        return DateTime.Now.Ticks / TimeSpan.TicksPerMillisecond;
    }

    public void Add(TKey key, TValue value)
    {
        lock (_lock)
        {
            if (!_entries.TryGetValue(key, out List<TimedQueueEntry>? entries))
            {
                entries = [];
                _entries[key] = entries;
            }

            entries.Add(new(value, Now()));
        }
    }

    public TValue[] Pop(TKey key)
    {
        lock (_lock)
        {
            if (!_entries.TryGetValue(key, out List<TimedQueueEntry>? entry))
            {
                return [];
            }

            long now = Now();
            TValue[] values = [.. entry.FindAll(value => now - value.timestamp < _timeoutMs).Select(value => value.value)];
            _ = _entries.Remove(key);
            return values;
        }
    }
}