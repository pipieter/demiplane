import type State from "../state";
import type Store from "../store";
import type ServerStatusView from "../views/serverstatus";
import Controller from "./controller";

class ServerStatusController extends Controller<ServerStatusView> {
  constructor(store: Store, state: State, view: ServerStatusView, socket: WebSocket) {
    super(store, state, view);
    socket.addEventListener("open", () => this.view.setOnline());
    socket.addEventListener("close", () => this.view.setOffline());
  }
}

export default ServerStatusController;
