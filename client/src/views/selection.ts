import { Listener, ListenerContainer } from "../listener";

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

  public select(previous: string[], current: string[]) {
    for (const id of previous) {
      document.getElementById(id)?.classList.remove("selected");
    }

    for (const id of current) {
      document.getElementById(id)?.classList.add("selected");
    }
  }

  public clear() {
    this.emit("clear_selection", null);
  }
}

export default SelectionView;
