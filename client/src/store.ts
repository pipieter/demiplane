import { Listener } from "./listener";
import type { RequestMessage } from "./messages";

export interface SocketListenerMap {
  open: Event;
  close: CloseEvent;
  message: MessageEvent;
}

class Store extends Listener<SocketListenerMap> {
  private url: string;
  private socket: WebSocket;
  private secret: string | null;
  private reconnectAttempts = 0;

  constructor(url: string) {
    super();

    this.url = url;
    this.socket = new WebSocket(this.url);
    this.secret = localStorage.getItem("secret");
    this.bindSocketListeners();
  }

  public attemptOpenWebSocket() {
    if (this.socket.readyState !== WebSocket.CLOSED) return;

    try {
      this.socket = new WebSocket(this.url);
    } finally {
      this.bindSocketListeners();
    }
  }

  public getSocketState(): number {
    return this.socket.readyState;
  }

  public bindSocketListeners() {
    this.socket.onopen = (evt: Event) => {
      this.reconnectAttempts = 0;
      this.emit("open", evt);
      this.send({ type: "request_sync", secret: this.getSecretToken() });
    };

    this.socket.onclose = (evt: CloseEvent) => {
      const delay = Math.max(Math.min(1000 * 2 ** this.reconnectAttempts, 30000), 5000);
      this.reconnectAttempts++;

      this.emit("close", evt);
      setTimeout(() => this.attemptOpenWebSocket(), delay);
    };

    this.socket.onmessage = (evt: MessageEvent) => this.emit("message", evt);
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
    if (this.socket.readyState !== WebSocket.OPEN) return;
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
