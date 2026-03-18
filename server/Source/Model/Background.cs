using Newtonsoft.Json;

namespace Demiplane.Model;

public class Background(string? href, int width, int height)
{
    [JsonProperty(Required = Required.AllowNull)]
    public string? href = href;

    [JsonProperty(Required = Required.Always)]
    public int width = width;

    [JsonProperty(Required = Required.Always)]
    public int height = height;

    public Background Clone()
    {
        return new(href, width, height);
    }
}
