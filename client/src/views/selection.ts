import Listeners from "../listener";
import View from "./view";

interface SelectionViewMap {
  clear_selection: null;
}

class SelectionViewListeners extends Listeners<SelectionViewMap> {
  protected keys(): (keyof SelectionViewMap)[] {
    return ["clear_selection"];
  }
}

class SelectionView extends View<SelectionViewListeners, SelectionViewMap> {
  private background: SVGSVGElement;

  constructor() {
    super(new SelectionViewListeners());

    this.background = document.getElementById("whiteboard-background-layer") as unknown as SVGSVGElement;
    this.background.onclick = () => this.clear();
  }

  public select(previous: string[], current: string[]) {
    for (const id of previous) {
      document.getElementById(id)?.classList.remove("selected");
    }

    for (const id of current) {
      document.getElementById(id)?.classList.add("selected");
    }
  }

  public clear() {
    this.listeners.emit("clear_selection", null);
  }
}

export default SelectionView;
