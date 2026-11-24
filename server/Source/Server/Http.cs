using System.Text;
using Demiplane.Services;
using Demiplane.Util;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace Demiplane.Server;

internal sealed class ImageUploadDto(string data)
{
    public string data = data;
}

internal sealed class DiscordTokenRequestDto
{
    public string? Code { get; set; }
}

internal sealed class DiscordTokenResponseDto
{
    [JsonProperty("access_token")]
    public string? AccessToken { get; set; }
}

public partial class Server
{
    private static readonly HttpClient HttpClient = new();

    private static async Task HandleHttpPost(HttpContext context)
    {
        if (context.Request.Path == "/images")
        {
            await HandleImageUpload(context);
        }
        else if (context.Request.Path == "/discord/token")
        {
            await HandleDiscordTokenExchange(context);
        }
    }

    private static async Task HandleImageUpload(HttpContext context)
    {
        context.Request.EnableBuffering();
        using StreamReader reader = new(context.Request.Body, Encoding.UTF8, leaveOpen: true);
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

    private static async Task HandleDiscordTokenExchange(HttpContext context)
    {
        using StreamReader reader = new(context.Request.Body, Encoding.UTF8, leaveOpen: true);
        string body = await reader.ReadToEndAsync(context.RequestAborted);
        DiscordTokenRequestDto? request;
        try
        {
            request = Json.Deserialize<DiscordTokenRequestDto>(body);
        }
        catch (JsonException)
        {
            await WriteJsonError(context, StatusCodes.Status400BadRequest, "The Discord authorization request is invalid.");
            return;
        }

        string? code = request?.Code;

        if (string.IsNullOrWhiteSpace(code))
        {
            await WriteJsonError(context, StatusCodes.Status400BadRequest, "A Discord authorization code is required.");
            return;
        }

        string? clientId = Environment.GetEnvironmentVariable("DISCORD_CLIENT_ID");
        string? clientSecret = Environment.GetEnvironmentVariable("DISCORD_CLIENT_SECRET");
        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
        {
            await WriteJsonError(context, StatusCodes.Status503ServiceUnavailable, "Discord OAuth is not configured.");
            return;
        }

        using FormUrlEncodedContent form = new(
            new Dictionary<string, string>
            {
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["grant_type"] = "authorization_code",
                ["code"] = code,
            }
        );
        using HttpResponseMessage response = await HttpClient.PostAsync(
            "https://discord.com/api/oauth2/token",
            form,
            context.RequestAborted
        );

        if (!response.IsSuccessStatusCode)
        {
            await WriteJsonError(context, StatusCodes.Status502BadGateway, "Discord rejected the authorization code.");
            return;
        }

        string responseBody = await response.Content.ReadAsStringAsync(context.RequestAborted);
        DiscordTokenResponseDto? token;
        try
        {
            token = JsonConvert.DeserializeObject<DiscordTokenResponseDto>(responseBody);
        }
        catch (JsonException)
        {
            await WriteJsonError(context, StatusCodes.Status502BadGateway, "Discord returned an invalid token response.");
            return;
        }

        string? accessToken = token?.AccessToken;
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            await WriteJsonError(context, StatusCodes.Status502BadGateway, "Discord did not return an access token.");
            return;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status200OK;
        await context.Response.WriteAsync(Json.Serialize(new { access_token = accessToken }));
    }

    private static async Task WriteJsonError(HttpContext context, int statusCode, string message)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsync(Json.Serialize(new { error = message }));
    }
}
