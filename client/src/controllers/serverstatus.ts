import type State from "../state";
import type Store from "../store";
import type ServerStatusView from "../views/serverstatus";
import Controller from "./controller";

class ServerStatusController extends Controller<ServerStatusView> {
  private syncTimeoutId: number | null = null;

  constructor(store: Store, state: State, view: ServerStatusView) {
    super(store, state, view);
    this.store.listen("open", () => this.view.setOnline());
    this.store.listen("close", () => this.view.setOffline());
    this.state.listen("user_change", () => {
      this.clearSyncTimeout();
      this.view.setOnline();
    });

    this.view.listen("manual_sync", () => this.manualSync());
  }

  private clearSyncTimeout() {
    if (this.syncTimeoutId === null) return;
    clearTimeout(this.syncTimeoutId);
    this.syncTimeoutId = null;
  }

  manualSync() {
    this.clearSyncTimeout();
    this.view.setSyncing();

    this.syncTimeoutId = window.setTimeout(() => {
      this.timeout();
    }, 12000);

    if (this.store.socket.readyState === WebSocket.CLOSED) {
      this.store.openWebSocket();
      return;
    }

    try {
      this.store.send({
        type: "request_sync",
        secret: this.store.getSecretToken(),
      });
    } catch {
      this.timeout();
    }
  }

  timeout() {
    this.view.setOffline();
    this.syncTimeoutId = null;
  }
}

export default ServerStatusController;
