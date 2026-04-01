import type { RequestMessage, ResponseMessage } from "./messages";
import type State from "./state";

class Store {
  private url: string;
  public socket: WebSocket;
  private secret: string | null;

  constructor(url: string, state: State) {
    this.url = url;
    this.socket = new WebSocket(this.url);
    this.secret = localStorage.getItem("secret");

    this.bindSocketListeners(state);
  }

  private onopen = () => {
    this.send({ type: "request_sync", secret: this.getSecretToken() });
  };

  public onSocketOpen = () => {};
  public onSocketClose = () => {};

  public openWebhook(state: State) {
    if (this.socket.readyState !== WebSocket.CLOSED) return;

    try {
      this.socket = new WebSocket(this.url);
    } finally {
      this.bindSocketListeners(state);
    }
  }

  public bindSocketListeners(state: State) {
    this.socket.onopen = () => {
      this.onopen();
      this.onSocketOpen();
    };

    this.socket.onclose = () => {
      this.onSocketClose();
      {
        setTimeout(() => this.openWebhook(state), 5000);
      }
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as ResponseMessage;

      switch (data.type) {
        case "create":
          state.createToken(data.create);
          break;

        case "delete":
          state.removeTokens(data.delete);
          break;

        case "grid":
          state.setGrid(data.grid);
          break;

        case "background": {
          state.setBackground(data.background.href, data.background.width, data.background.height);
          break;
        }

        case "transform":
          state.transformToken(data.transform);
          break;

        case "user_change":
          state.setUser(data.user);
          break;

        case "user_disconnect":
          state.removeUser(data.userId);
          break;

        case "sync":
          state.clearTokens();
          state.clearSelected();
          state.setGrid(data.grid);
          state.setBackground(data.background.href, data.background.width, data.background.height);
          state.createTokens(data.tokens);
          state.setUsers(data.users);
          this.setSecretToken(data.secret);
          state.setMe(data.me);
          break;

        case "error":
          alert(`An error has occurred, re-syncing. '${data.message}'`);
          this.send({ type: "request_sync", secret: this.getSecretToken() });
          break;

        default:
          throw `Unknown message type: ${JSON.stringify(data)}`;
      }
    };
  }

  public async uploadImage(base64: string): Promise<string> {
    const url = `${this.url}/images`;
    const body = JSON.stringify({ data: base64 });
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    };

    const response = await fetch(url, options);
    if (!response) throw `Could not send image to backend.`;

    const data = await response.json();
    if (data?.status !== "success") throw `Could not upload image: ${data?.message}`;

    return data.href;
  }

  public send(req: RequestMessage) {
    this.socket.send(JSON.stringify(req));
  }

  public setSecretToken(secret: string) {
    this.secret = secret;
    localStorage.setItem("secret", secret);
  }

  public getSecretToken(): string | null {
    if (!this.secret) {
      this.secret = localStorage.getItem("secret");
    }
    return this.secret;
  }
}

export default Store;
