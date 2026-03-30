import { Listener, ListenerContainer } from "../listener";

interface ServerStatusViewMap {
  manual_sync: { isSyncing: boolean };
}

class ServerStatusListeners extends Listener<ServerStatusViewMap> {
  protected override keys(): (keyof ServerStatusViewMap)[] {
    return ["manual_sync"];
  }
}

class ServerStatusView extends ListenerContainer<ServerStatusListeners, ServerStatusViewMap> {
  private container: HTMLElement;
  private statusSymbol: HTMLElement;
  private statusText: HTMLParagraphElement;
  private isSyncing: boolean;

  constructor() {
    super(new ServerStatusListeners());

    this.container = document.getElementById("server-status") as unknown as HTMLElement;
    this.statusSymbol = document.getElementById("server-status-icon") as unknown as HTMLElement;
    this.statusText = document.getElementById("server-status-text") as unknown as HTMLParagraphElement;
    this.isSyncing = false;

    this.setOffline();
    this.container.addEventListener("click", () => this.onClick());
  }

  onClick() {
    if (this.isSyncing) return;
    this.emit("manual_sync", { isSyncing: this.isSyncing });
  }

  setOffline() {
    this.container.classList = "server-offline";
    this.statusSymbol.classList = "fa-solid fa-xmark";
    this.statusText.textContent = "Offline";
    this.isSyncing = false;
    document.body.style.cursor = "default";
  }

  setSyncing() {
    this.container.classList = "server-syncing";
    this.statusSymbol.classList = "fa-solid fa-rotate";
    this.statusText.textContent = "Syncing";
    this.isSyncing = true;
    document.body.style.cursor = "progress";
  }

  setOnline() {
    this.container.classList = "server-online";
    this.statusSymbol.classList = "fa-solid fa-check";
    this.statusText.textContent = "Online ";
    this.isSyncing = false;
    document.body.style.cursor = "default";
  }
}

export default ServerStatusView;
