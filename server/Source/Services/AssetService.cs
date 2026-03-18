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
        Directory.CreateDirectory(Root);
        Directory.CreateDirectory(ImageRoot);
    }

    public Asset? UploadImage(string data)
    {
        string name = $"image-{Guid.NewGuid()}";
        string? filename = Image.SaveBase64Image(name, ImageRoot, data);

        if (filename == null)
            return null;

        string path = $"{ImageRoot}/{filename}";
        string href = $"/images/{filename}";
        return new(path, href);
    }

    public Asset? Find(string href)
    {
        string path = $"{Root}{href}";
        if (!File.Exists(path))
            return null;

        return new(path, href);
    }
}
