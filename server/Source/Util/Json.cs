using System.Runtime.CompilerServices;
using Demiplane.Model;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Demiplane.Util;

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

    /// <summary>
    /// Converter class specifically for JSON objects containing a "type" field.
    /// </summary>
    /// <typeparam name="T">The root class of the types</typeparam>
    public abstract class TypeConverter<T> : JsonConverter
    {
        public abstract Dictionary<string, Type> TypeMap { get; }

        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(T);
        }

        public override object? ReadJson(
            JsonReader reader,
            Type objectType,
            object? existingValue,
            JsonSerializer serializer
        )
        {
            JObject? obj = JObject.Load(reader);
            if (obj == null)
                return null;

            string? typeName = obj["type"]?.Value<string>();

            if (typeName == null)
                return null;

            Type? type = TypeMap[typeName];
            if (type == null)
                return null;

            var instance = RuntimeHelpers.GetUninitializedObject(type);
            serializer.Populate(obj.CreateReader(), instance);

            return instance;
        }

        public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }
    }
}
