import AutosizeInput from "../components/AutosizeInput";
import { Listener } from "../listener";
import type { BackgroundLayer } from "../models/background";
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
      const li = document.createElement("li");
      li.id = `background-layer-${layer.id}`;
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.addEventListener("click", () => this.emit("background_layer_select", layer.id));

      if (background.selected === layer.id) {
        li.classList.add("selected");
      }

      const nameInput = AutosizeInput(layer.name);
      nameInput.type = "text";
      nameInput.classList.add("token-name-input");
      nameInput.maxLength = 36;
      nameInput.minLength = 1;

      nameInput.addEventListener("click", (e) => e.stopPropagation());
      nameInput.addEventListener("change", () => this.onRename(layer, nameInput));
      nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") nameInput.blur(); // Trigger change-event
      });

      const deleteIcon = document.createElement("i");
      deleteIcon.classList.add("fa-solid", "fa-trash");
      deleteIcon.onclick = (e) => {
        e.stopPropagation(); // Prevent clicking through the icon onto the li
        this.emit("background_layer_delete", layer.id);
      };

      li.onclick = () => this.emit("background_layer_select", layer.id);

      li.appendChild(nameInput);
      li.appendChild(deleteIcon);
      this.layersDiv.appendChild(li);
    }
  }

  private onRename(layer: BackgroundLayer, input: HTMLInputElement) {
    const name = input.value.trim();
    if (layer.name === name) return;
    if (!name || name.length > input.maxLength || name.length < input.minLength) {
      input.value = layer.name;
      return;
    }

    this.emit("background_layer_rename", [layer.id, name]);
  }
}

export default BackgroundListView;
