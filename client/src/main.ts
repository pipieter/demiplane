import { drawing } from "./drawing";
import { grid, setGrid } from "./grid";
import { header } from "./header";
import type { CreateRequestMessage, ResponseMessage } from "./messages";
import socket, { uploadImageToBackend } from "./socket";
import { readBase64 } from "./util";
import { viewport } from "./viewport";

drawing.initialize();
header.initialize();
viewport.initialize();

socket.onmessage = function (event) {
  const data = JSON.parse(event.data) as ResponseMessage;

  if (data.type === "create") {
    drawing.createToken(data.create);
  } else if (data.type === "move") {
    drawing.move(data.move.id, data.move.x, data.move.y);
  } else if (data.type === "grid") {
    setGrid(data.grid);
  }
};

const randomCircleButton = document.getElementById("random-circle-button") as HTMLButtonElement;
const randomRectangleButton = document.getElementById("random-rect-button") as HTMLButtonElement;
const uploadTokenInput = document.getElementById("upload-token-button") as HTMLInputElement;

function getRandomPosition(): { x: number; y: number } {
  return {
    x: Math.floor(Math.random() * 1280),
    y: Math.floor(Math.random() * 600),
  };
}

function getRandomColor(): string {
  const colors = ["red", "blue", "orange", "yellow", "green", "purple", "pink", "black", "cyan", "lime"];
  return colors[Math.floor(Math.random() * colors.length)];
}

randomCircleButton.onclick = () => {
  const { x, y } = getRandomPosition();

  const message: CreateRequestMessage = {
    type: "request_create",
    create: {
      type: "circle",
      color: getRandomColor(),
      x,
      y,
      w: grid.size / 2,
      h: grid.size / 2,
    },
  };
  socket.send(JSON.stringify(message));
};

randomRectangleButton.onclick = () => {
  const { x, y } = getRandomPosition();
  const w = grid.size;
  const h = grid.size;

  const message: CreateRequestMessage = {
    type: "request_create",
    create: {
      type: "rectangle",
      color: getRandomColor(),
      x,
      y,
      w,
      h,
    },
  };
  socket.send(JSON.stringify(message));
};

uploadTokenInput.addEventListener("change", async (evt: Event) => {
  // @ts-expect-error Files should be a valid field
  const file = evt.target?.files[0];
  if (!file) {
    console.error("Could not open file.");
    return;
  }

  const base64 = await readBase64(file);
  if (!base64) {
    console.error("Could not read file.");
    return;
  }

  const href = await uploadImageToBackend(base64);
  if (!href) {
    console.error("Could not upload image to server.");
    return;
  }

  const { x, y } = getRandomPosition();
  const w = grid.size;
  const h = grid.size;

  const message: CreateRequestMessage = {
    type: "request_create",
    create: {
      type: "image",
      href,
      x,
      y,
      w,
      h,
    },
  };
  socket.send(JSON.stringify(message));
});
