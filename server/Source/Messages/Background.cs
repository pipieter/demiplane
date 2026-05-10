using Demiplane.Model;
using Newtonsoft.Json;

namespace Demiplane.Messages;

public class BackgroundAddLayerRequestMessage(BackgroundLayer layer) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "request_background_add_layer";

    [JsonProperty(Required = Required.Always)]
    public BackgroundLayer layer = layer;
}

public class BackgroundAddLayerResponseMessage(BackgroundLayer layer) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "background_add_layer";

    [JsonProperty(Required = Required.Always)]
    public BackgroundLayer layer = layer;
}

public class BackgroundSelectLayerRequestMessage(string id) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "request_background_select_layer";

    [JsonProperty(Required = Required.Always)]
    public string id = id;

}

public class BackgroundSelectLayerResponseMessage(string id) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "background_select_layer";

    [JsonProperty(Required = Required.Always)]
    public string id = id;
}

public class BackgroundRenameLayerRequestMessage(string id, string name) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "request_background_rename_layer";

    [JsonProperty(Required = Required.Always)]
    public string id = id;

    [JsonProperty(Required = Required.Always)]
    public string name = name;
}

public class BackgroundRenameLayerResponseMessage(string id, string name) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "background_rename_layer";

    [JsonProperty(Required = Required.Always)]
    public string id = id;

    [JsonProperty(Required = Required.Always)]
    public string name = name;
}


public class BackgroundDeleteLayerRequestMessage(string id) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "request_background_delete_layer";

    [JsonProperty(Required = Required.Always)]
    public string id = id;

}

public class BackgroundDeleteLayerResponseMessage(string id) : Message
{
    [JsonProperty(Required = Required.Always)]
    public string type = "background_delete_layer";

    [JsonProperty(Required = Required.Always)]
    public string id = id;
}
