using System.Text;
using Demiplane.Services;
using Demiplane.Util;
using Microsoft.AspNetCore.Http;

namespace Demiplane.Server;

internal sealed class ImageUploadDto(string data)
{
    public string data = data;
}

public partial class Server
{
    private async Task HandleHttpPost(HttpContext context)
    {
        if (context.Request.Path == "/images")
        {
            await HandleImageUpload(context);
        }
    }

    private async Task HandleImageUpload(HttpContext context)
    {
        context.Request.EnableBuffering();
        using StreamReader reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
        string body = await reader.ReadToEndAsync();
        context.Request.Body.Position = 0; // Reset the stream position

        if (body == null)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = 400;
            await context.Response.WriteAsync(/*lang=json,strict*/ "{\"status\": \"error\", \"message\":\"Could not receive data.\"}");
            return;
        }

        ImageUploadDto? contents = Json.Deserialize<ImageUploadDto>(body);

        if (contents?.data is null)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = 400;
            await context.Response.WriteAsync(
                /*lang=json,strict*/
                                     "{\"status\": \"error\", \"message\":\"Invalid or missing data field, expected string.\"}"
            );
            return;
        }

        Asset? asset = AssetService.UploadImage(contents.data);
        if (asset == null)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = 400;
            await context.Response.WriteAsync(/*lang=json,strict*/ "{\"status\": \"error\", \"message\":\"Could not parse image.\"}");
            return;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = 200;
        await context.Response.WriteAsync($"{{\"status\": \"success\", \"href\": \"{asset.Href}\"}}");
        return;
    }
}
