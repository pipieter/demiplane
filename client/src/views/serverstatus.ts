class ServerStatusView {
  private container: HTMLElement;
  private statusSymbol: HTMLElement;
  private statusText: HTMLParagraphElement;

  constructor() {
    this.container = document.getElementById("server-status") as unknown as HTMLElement;
    this.statusSymbol = document.getElementById("server-status-icon") as unknown as HTMLElement;
    this.statusText = document.getElementById("server-status-text") as unknown as HTMLParagraphElement;

    this.setOffline();
  }

  setOffline() {
    this.container.classList = "server-offline";
    this.statusSymbol.classList = "fa-solid fa-xmark";
    this.statusText.textContent = "Offline";
    document.body.style.cursor = "default";
  }

  setSyncing() {
    this.container.classList = "server-syncing";
    this.statusSymbol.classList = "fa-solid fa-rotate";
    this.statusText.textContent = "Syncing";
    document.body.style.cursor = "progress";
  }

  setOnline() {
    this.container.classList = "server-online";
    this.statusSymbol.classList = "fa-solid fa-check";
    this.statusText.textContent = "Online ";
    document.body.style.cursor = "default";
  }
}

export default ServerStatusView;
