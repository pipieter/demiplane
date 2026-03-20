// Check if currently being hosted in discord as a discord activity
// If so, we have to use the local /server proxy, as set-up by discord
// (see the README on how to do this)

import type { RequestMessage } from "./messages";

export class Server {
  public url: string;
  public socket: WebSocket;

  constructor(url: string, socket: WebSocket) {
    this.url = url;
    this.socket = socket;
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
}

const BackendURL = location.host.includes(".discordsays.com") ? "/server" : import.meta.env.VITE_SERVER_URL;
const socket = new WebSocket(BackendURL);

async function uploadImageToBackend(base64: string): Promise<string | null> {
  const url = BackendURL + "/images";
  const body = JSON.stringify({ data: base64 });
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    console.error(`Could not send image to backend.`);
    return null;
  }

  const responseData = await response.json();

  if (responseData?.status !== "success") {
    console.error(`Could not upload image: ${responseData?.message}`);
    return null;
  }

  return responseData?.href;
}

function send(req: RequestMessage) {
  socket.send(JSON.stringify(req));
}

export const server = { send, socket, uploadImageToBackend, BackendURL };
