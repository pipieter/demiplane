import Listeners from "../listener";

interface SelectionViewListenersMap {
  clear_selection: null;
}

class SelectionViewListeners extends Listeners<SelectionViewListenersMap> {
  protected keys(): (keyof SelectionViewListenersMap)[] {
    return ["clear_selection"];
  }
}

class SelectionView {
  private background: SVGSVGElement;
  private listeners: SelectionViewListeners;

  constructor() {
    this.background = document.getElementById("whiteboard-background-layer") as unknown as SVGSVGElement;
    this.listeners = new SelectionViewListeners();

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

  public listen<K extends keyof SelectionViewListenersMap>(
    type: K,
    listener: (value: SelectionViewListenersMap[K]) => void,
  ) {
    this.listeners.listen(type, listener);
  }
}

export default SelectionView;
