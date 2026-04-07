import { Listener } from "../listener";

interface ServerStatusViewMap {
  manual_sync: { isSyncing: boolean };
}

class ServerStatusView extends Listener<ServerStatusViewMap> {
  public readonly container: HTMLElement;
  public readonly statusSymbol: HTMLElement;
  public readonly statusText: HTMLParagraphElement;
  private isSyncing: boolean;

  constructor() {
    super();

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
