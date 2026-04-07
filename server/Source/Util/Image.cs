namespace Demiplane.Util;

public class Image
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

    public static string? SaveBase64Image(string name, string directory, string base64)
    {
        if (!ExtractImageDataFromBase64(base64, out string extension, out string data))
        {
            return null;
        }

        string filename = $"{name}.{extension}";
        string path = $"{directory}/{filename}";
        byte[] bytes = Convert.FromBase64String(data);

        File.WriteAllBytes(path, bytes);
        return filename;
    }

    public static bool IsImage(string path)
    {
        if (!File.Exists(path))
        {
            return false;
        }

        try
        {
            _ = SixLabors.ImageSharp.Image.Load(path);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public static (int, int) GetSize(string path)
    {
        SixLabors.ImageSharp.Image image = SixLabors.ImageSharp.Image.Load(path);
        return (image.Size.Width, image.Size.Height);
    }
}
