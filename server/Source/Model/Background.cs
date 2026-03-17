using Newtonsoft.Json;

namespace Demiplane.Model;

public class Background(string? href, int width, int height)
{
    [JsonProperty(Required = Required.Always)]
    public string? href = href;

    [JsonProperty(Required = Required.Always)]
    public int width = width;

    [JsonProperty(Required = Required.Always)]
    public int height = height;

    public static Background? FindFromHref(string href)
    {
        string fullPath = $"./wwwroot{href}";
        if (!File.Exists(fullPath))
            return null;

        SixLabors.ImageSharp.Image image = SixLabors.ImageSharp.Image.Load(fullPath);
        return new(href, image.Size.Width, image.Size.Height);
    }

    public Background Clone()
    {
        return new(href, width, height);
    }
}
