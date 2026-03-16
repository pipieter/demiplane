using Newtonsoft.Json;
using Server.Tokens;

namespace Server.Util;

/// <summary>
/// Wrapper class to make JSON operations easier and less verbose.
/// </summary>
public static class Json
{
    public static string Serialize(object value)
    {
        return JsonConvert.SerializeObject(value);
    }

    public static T? Deserialize<T>(string value)
    {
        JsonConverter[] converters = [new TokenJsonConverter()];
        JsonSerializerSettings settings = new() { TypeNameHandling = TypeNameHandling.Auto, Converters = converters };
        return JsonConvert.DeserializeObject<T>(value, settings);
    }
}
