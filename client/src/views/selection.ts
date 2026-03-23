import { Listener, ListenerContainer } from "../listener";
import type { Token } from "../models/token";

interface SelectionViewMap {
  clear_selection: null;
}

class SelectionViewListeners extends Listener<SelectionViewMap> {
  protected keys(): (keyof SelectionViewMap)[] {
    return ["clear_selection"];
  }
}

class SelectionView extends ListenerContainer<SelectionViewListeners, SelectionViewMap> {
  private background: SVGSVGElement;

  constructor() {
    super(new SelectionViewListeners());

    this.background = document.getElementById("whiteboard-background-layer") as unknown as SVGSVGElement;
    this.background.onclick = () => this.clear();
  }

  public select(previous: Token[], current: Token[]) {
    for (const token of previous) {
      document.getElementById(token.id)?.classList.remove("selected");
    }

    for (const token of current) {
      document.getElementById(token.id)?.classList.add("selected");
    }
  }

  public clear() {
    this.emit("clear_selection", null);
  }
}

export default SelectionView;
