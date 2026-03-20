import { grid } from "./whiteboard/grid";
import { header } from "./header";
import type { ResponseMessage } from "./messages";
import { viewport } from "./whiteboard/viewport";
import { util } from "./util";
import { Server, server } from "./server";
import drawFree from "./whiteboard/drawing/free";
import drawCircle from "./whiteboard/drawing/circle";
import drawRectangle from "./whiteboard/drawing/rectangle";
import tokens from "./whiteboard/tokens";
import selection from "./whiteboard/selection";
import Background from "./models/background";
import BackgroundView from "./views/background";
import BackgroundController from "./controllers/background";

tokens.initialize();
selection.initialize();
header.initialize();
viewport.initialize();
grid.initialize();

const server_ = new Server(server.BackendURL, server.socket);

const backgroundModel = new Background();
const backgroundView = new BackgroundView();
const backgroundController = new BackgroundController(server_, backgroundModel, backgroundView);

server.socket.onmessage = function (event) {
  const data = JSON.parse(event.data) as ResponseMessage;

  switch (data.type) {
    case "create":
      tokens.create(data.create);
      break;

    case "delete":
      for (const id of data.delete) {
        tokens.remove(id);
      }
      break;

    case "grid":
      grid.set(data.grid.size, data.grid.offset.x, data.grid.offset.y);
      break;

    case "background": {
      backgroundController.set(data.background.href, data.background.width, data.background.height);
      break;
    }

    case "transform":
      tokens.transform(data.transform.id, data.transform.x, data.transform.y, data.transform.w, data.transform.h);
      break;

    case "sync":
      grid.set(data.grid.size, data.grid.offset.x, data.grid.offset.y);
      backgroundController.set(data.background.href, data.background.width, data.background.height);
      for (const token of data.tokens) {
        tokens.create(token);
      }
      break;

    default:
      throw `Unknown message type: ${JSON.stringify(data)}`;
  }
};

const beginCircleButton = document.getElementById("begin-circle-button") as HTMLButtonElement;
const beginRectangleButton = document.getElementById("begin-rect-button") as HTMLButtonElement;
const beginDrawingButton = document.getElementById("begin-drawing-button") as HTMLButtonElement;
const uploadTokenInput = document.getElementById("upload-token-button") as HTMLInputElement;

function getRandomPosition(): { x: number; y: number } {
  return {
    x: Math.floor(Math.random() * 1280),
    y: Math.floor(Math.random() * 600),
  };
}

beginCircleButton.onclick = drawCircle.begin;
beginRectangleButton.onclick = drawRectangle.begin;
beginDrawingButton.onclick = drawFree.begin;

uploadTokenInput.addEventListener("change", async (evt: Event) => {
  // @ts-expect-error Files should be a valid field
  const file = evt.target?.files[0];
  if (!file) {
    console.error("Could not open file.");
    return;
  }

  const base64 = await util.readBase64(file);
  if (!base64) {
    console.error("Could not read file.");
    return;
  }

  const href = await server.uploadImageToBackend(base64);
  if (!href) {
    console.error("Could not upload image to server.");
    return;
  }

  const { x, y } = getRandomPosition();
  const w = grid.get().size;
  const h = grid.get().size;

  server.send({
    type: "request_create",
    create: {
      type: "image",
      id: crypto.randomUUID(),
      href,
      x,
      y,
      w,
      h,
    },
  });
});
