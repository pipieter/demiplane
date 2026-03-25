import { TokenListenerContainer } from "../listeners";
import type { Token } from "../models/token";

class SelectionView extends TokenListenerContainer {
  private background: SVGSVGElement;
  private selected: Token[];

  constructor() {
    super();

    this.background = document.getElementById("whiteboard-background-layer") as unknown as SVGSVGElement;
    this.background.onclick = () => this.clear();
    this.selected = [];

    window.addEventListener("keydown", (evt) => {
      // Don't trigger this event if focused on another input, e.g. a text input
      if (document.activeElement?.tagName.toLowerCase() === "input") return;

      const keys = ["Delete", "Backspace"];
      if (this.selected && keys.includes(evt.key)) {
        this.delete();
      }
    });
  }

  public select(previous: Token[], current: Token[]) {
    for (const token of previous) {
      document.getElementById(token.id)?.classList.remove("selected");
    }

    for (const token of current) {
      document.getElementById(token.id)?.classList.add("selected");
    }

    this.selected = [...current];
  }

  public clear() {
    this.emit("tokens_select", []);
  }

  public delete() {
    this.emit("tokens_delete", [...this.selected]);
  }
}

export default SelectionView;
