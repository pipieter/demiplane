using Newtonsoft.Json;

namespace Demiplane.Model;

public class Offset(int x, int y)
{
    [JsonProperty(Required = Required.Always)]
    public int x = x;

    [JsonProperty(Required = Required.Always)]
    public int y = y;
}

public class Grid(int size, int offsetX, int offsetY)
{
    [JsonProperty(Required = Required.Always)]
    public int size = size;

    [JsonProperty(Required = Required.Always)]
    public Offset offset = new(offsetX, offsetY);

    public Grid Clone()
    {
        return new Grid(size, offset.x, offset.y);
    }
}
