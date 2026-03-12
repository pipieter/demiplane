namespace Server;

public class Background(string href, int width, int height)
{
    public string href = href;
    public int width = width;
    public int height = height;

    public static Background? CreateFromBase64(string base64)
    {
        string filename = $"background-${Guid.NewGuid()}";
        string? href = Util.Image.SaveBase64Image(filename, base64);

        if (href == null)
            return null;

        string fullPath = $"./wwwroot{href}";
        SixLabors.ImageSharp.Image image = SixLabors.ImageSharp.Image.Load(fullPath);
        return new(href, image.Size.Width, image.Size.Height);
    }

    public Background Clone()
    {
        return new(href, width, height);
    }
}
