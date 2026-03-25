using Newtonsoft.Json;

namespace Demiplane.Model;

public class User(string id, string secret, string name, string color)
{
    [JsonIgnore]
    public string secret = secret;
    [JsonIgnore]
    public bool isActive = true;
    [JsonProperty(Required = Required.Always)]
    public string id = id;

    [JsonProperty(Required = Required.Always)]
    public string name = name;

    [JsonProperty(Required = Required.Always)]
    public string color = color;
}

