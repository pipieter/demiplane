using System.Runtime.CompilerServices;

namespace Server.Util;

public class ImageResult(string href, string localPath)
{
    public readonly string href = href;
    public readonly string localPath = localPath;
}

public static class Image
{
    private static bool ExtractImageDataFromBase64(string base64, out string type, out string data)
    {
        int commaIndex = base64.IndexOf(',');
        if (commaIndex == -1)
        {
            type = "";
            data = "";
            return false;
        }

        // Extract the header and the main base64 data
        string header = base64[..commaIndex];
        data = base64[(commaIndex + 1)..];

        // Extract the image type from the header
        string[] headerParts = header.Split(';');
        string typePart = headerParts[0]; // Should contain "data:image/type"
        type = typePart.Split('/')[1]; // Get type, e.g. "png"

        return true;
    }

    public static ImageResult? SaveBase64Image(string name, string base64)
    {
        if (!ExtractImageDataFromBase64(base64, out string extension, out string data))
            return null;

        string filename = $"{name}.{extension}";

        // Note, due to how the ASP.NET Core works, static files need to be stored in wwwroot.
        // The href will be a subdirectory in wwwroot.
        string localPath = $"./wwwroot/images/{filename}";
        string href = $"/images/{filename}";
        byte[] bytes = Convert.FromBase64String(data);

        File.WriteAllBytes(localPath, bytes);
        return new(href, localPath);
    }
}
