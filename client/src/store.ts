import type { RequestMessage } from "./messages";

class Store {
  private url: string;
  public socket: WebSocket;
  private secret: string | null;
  private reconnectAttempts = 0;

  public onSocketOpen = () => { };
  public onSocketClose = () => { };
  public onSocketMessage = (_event: MessageEvent) => { };

  constructor(url: string) {
    this.url = url;
    this.socket = new WebSocket(this.url);
    this.secret = localStorage.getItem("secret");

    this.bindSocketListeners();
  }

  public openWebhook() {
    if (this.socket.readyState !== WebSocket.CLOSED) return;

    try {
      this.socket = new WebSocket(this.url);
    } finally {
      this.bindSocketListeners();
    }
  }

  public bindSocketListeners() {
    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.send({ type: "request_sync", secret: this.getSecretToken() });
      this.onSocketOpen();
    };

    this.socket.onclose = () => {
      const delay = Math.max(Math.min(1000 * 2 ** this.reconnectAttempts, 30000), 5000);
      this.reconnectAttempts++;

      this.onSocketClose();
      setTimeout(() => this.openWebhook(), delay);
    };

    this.socket.onmessage = (event) => { this.onSocketMessage(event) };
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
