using Demiplane.Util;

namespace Demiplane.Services;

public class Asset(string path, string href)
{
    public string Path = path;
    public string Href = href;
}

public class AssetService
{
    public const string Root = "./wwwroot";
    public const string ImageRoot = "./wwwroot/images";

    public AssetService()
    {
        _ = Directory.CreateDirectory(Root);
        _ = Directory.CreateDirectory(ImageRoot);
    }

    public static Asset? UploadImage(string data)
    {
        string name = $"image-{Guid.NewGuid()}";
        string? filename = Image.SaveBase64Image(name, ImageRoot, data);

        if (filename == null)
        {
            return null;
        }

        string path = $"{ImageRoot}/{filename}";
        string href = $"/images/{filename}";
        return new(path, href);
    }

    public static Asset? Find(string href)
    {
        string path = $"{Root}{href}";
        return !File.Exists(path) ? null : new(path, href);
    }
}
