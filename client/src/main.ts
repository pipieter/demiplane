import { whiteboard } from "./whiteboard";
import { grid } from "./grid";
import { header } from "./header";
import type { ResponseMessage } from "./messages";
import { transform } from "./transform";
import { viewport } from "./viewport";
import { util } from "./util";
import { server } from "./server";
import drawFree from "./whiteboard/drawing/free";
import drawCircle from "./whiteboard/drawing/circle";
import drawRectangle from "./whiteboard/drawing/rectangle";

whiteboard.initialize();
header.initialize();
viewport.initialize();
grid.initialize();

server.socket.onmessage = function (event) {
  const data = JSON.parse(event.data) as ResponseMessage;

  switch (data.type) {
    case "create":
      whiteboard.createToken(data.create);
      break;

    case "delete":
      for (const id of data.delete) {
        whiteboard.deleteToken(id);
      }
      break;

    case "grid":
      grid.set(data.grid.size, data.grid.offset.x, data.grid.offset.y);
      break;

    case "background": {
      whiteboard.setBackground(data.background.href, data.background.width, data.background.height);
      break;
    }

    case "transform":
      transform.setTransform(data.transform.id, data.transform.x, data.transform.y, data.transform.w, data.transform.h);
      break;

    case "sync":
      grid.set(data.grid.size, data.grid.offset.x, data.grid.offset.y);
      whiteboard.setBackground(data.background.href, data.background.width, data.background.height);
      for (const token of data.tokens) {
        whiteboard.createToken(token);
      }
      break;

    default:
      throw `Unknown message type: ${JSON.stringify(data)}`;
  }
};

const randomCircleButton = document.getElementById("random-circle-button") as HTMLButtonElement;
const randomRectangleButton = document.getElementById("random-rect-button") as HTMLButtonElement;
const beginDrawingButton = document.getElementById("begin-drawing-button") as HTMLButtonElement;
const uploadTokenInput = document.getElementById("upload-token-button") as HTMLInputElement;
const uploadBackgroundInput = document.getElementById("upload-background-button") as HTMLInputElement;

function getRandomPosition(): { x: number; y: number } {
  return {
    x: Math.floor(Math.random() * 1280),
    y: Math.floor(Math.random() * 600),
  };
}

randomCircleButton.onclick = drawCircle.begin;
randomRectangleButton.onclick = drawRectangle.begin;
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
      href,
      x,
      y,
      w,
      h,
    },
  });
});

uploadBackgroundInput.addEventListener("change", async (evt: Event) => {
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

  server.send({
    type: "request_background",
    href,
  });
});
