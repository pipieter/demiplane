import type { RequestMessage } from "./messages";

class Store {
  private url: string;
  private socket: WebSocket;
  private secret: string | null;

  constructor(url: string, socket: WebSocket) {
    this.url = url;
    this.socket = socket;
    this.secret = localStorage.getItem("secret");

    this.socket.onopen = this.onopen.bind(this);
  }

  private onopen = () => {
    this.send({ type: "request_sync", secret: this.getSecretToken() });
  };

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
