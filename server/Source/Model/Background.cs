using Newtonsoft.Json;

namespace Demiplane.Model;

public class BackgroundLayer(string id, string name, string? href, int width, int height)
{
    [JsonProperty(Required = Required.Always)]
    public string id = id;

    [JsonProperty(Required = Required.Always)]
    public string name = name;

    [JsonProperty(Required = Required.AllowNull)]
    public string? href = href;

    [JsonProperty(Required = Required.Always)]
    public int width = width;

    [JsonProperty(Required = Required.Always)]
    public int height = height;

    public BackgroundLayer Clone()
    {
        return new(id, name, href, width, height);
    }
}

public class Background(BackgroundLayer[] layers, string? selected)
{
    [JsonProperty(Required = Required.Always)]
    public BackgroundLayer[] layers = layers;

    [JsonProperty(Required = Required.AllowNull)]
    public string? selected = selected;

    public Background Clone()
    {
        BackgroundLayer[] layers = [.. this.layers.Select(layer => layer.Clone())];
        return new(layers, selected);
    }

    public void AddLayer(BackgroundLayer layer)
    {
        // Check if layer with the id already exists, if it does, raise an error
        if (layers.FirstOrDefault(l => layer.id == l.id) != null)
        {
            throw new ArgumentException($"A layer with id {layer.id} already exists!");
        }

        layers = [.. layers, layer];
    }

    public void RenameLayer(string id, string name)
    {
        BackgroundLayer layer = layers.FirstOrDefault(layer => layer.id == id) ?? throw new KeyNotFoundException($"Could not find layer with id {id}!");
        layer.name = name;
    }

    public void DeleteLayer(string id)
    {
        layers = [.. layers.Where(layer => layer.id != id)];

        if (id == selected)
        {
            selected = null;
        }
    }
}
