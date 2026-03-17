using System.Text;
using Demiplane.Services;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace Demiplane.Server;

public partial class Server
{
    private async Task HandleHttpPost(HttpContext context)
    {
        if (context.Request.Path == "/images")
            await HandleImageUpload(context);
    }

    private static async Task HandleImageUpload(HttpContext context)
    {
        context.Request.EnableBuffering();
        using var reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
        var body = await reader.ReadToEndAsync();
        context.Request.Body.Position = 0; // Reset the stream position

        if (body == null)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = 400;
            await context.Response.WriteAsync("{\"status\": \"error\", \"message\":\"Could not receive data.\"}");
            return;
        }

        dynamic? contents = JsonConvert.DeserializeObject(body);
        dynamic? data = contents?.data?.Value;

        if (data is not string)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = 400;
            await context.Response.WriteAsync(
                "{\"status\": \"error\", \"message\":\"Invalid or missing data field, expected string.\"}"
            );
            return;
        }

        Asset? asset = AssetService.UploadImage(data);
        if (asset == null)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = 400;
            await context.Response.WriteAsync("{\"status\": \"error\", \"message\":\"Could not parse image.\"}");
            return;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = 200;
        await context.Response.WriteAsync($"{{\"status\": \"success\", \"href\": \"{asset.Href}\"}}");
        return;
    }
}
