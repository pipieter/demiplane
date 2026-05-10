import { Listener } from "../listener";
import type Background from "../models/background";

interface BackgroundListViewMap {
  background_layer_rename: [string, string];
  background_layer_select: string;
  background_layer_delete: string;
  background_upload: File;
}

class BackgroundListView extends Listener<BackgroundListViewMap> {
  public readonly input: HTMLInputElement;
  public readonly layersDiv: HTMLDivElement;

  constructor() {
    super();

    this.input = document.getElementById("upload-background-button") as HTMLInputElement;
    this.layersDiv = document.getElementById("background-layers-list") as HTMLDivElement;

    this.input.onchange = (evt) => {
      const file = (evt.target as HTMLInputElement).files?.item(0);
      if (file) {
        this.emit("background_upload", file);
      }
    };
  }

  public update(background: Background) {
    this.layersDiv.replaceChildren();

    // Iterate in reverse order
    const layers = [...background.layers].reverse();
    for (const layer of layers) {
      const div = document.createElement("div");
      const name = document.createElement("p");

      div.id = `background-layer-${layer.id}`;
      div.onclick = () => this.emit("background_layer_select", layer.id);
      name.innerText = layer.name;

      if (layer.id === background.selected) {
        name.style.color = "red";
      }

      div.appendChild(name);
      this.layersDiv.appendChild(div);
    }

    console.log(this.layersDiv);
    console.log(background);
  }
}

export default BackgroundListView;
