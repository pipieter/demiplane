import { drawing } from "./drawing";
import { grid, setGrid } from "./grid";
import type { BackgroundRequestMessage, CreateRequestMessage, ResponseMessage } from "./messages";
import socket, { BackendURL } from "./socket";
import { initViewport } from "./viewport";
import { readFileContentsBase64 } from "./util";

drawing.initialize();
initViewport();

socket.onmessage = function (event) {
  const data = JSON.parse(event.data) as ResponseMessage;

  if (data.type === "create") {
    drawing.createToken(data.create);
  } else if (data.type === "move") {
    drawing.move(data.move.id, data.move.x, data.move.y);
  } else if (data.type === "grid") {
    setGrid(data.grid);
  } else if (data.type == "background") {
    const href = BackendURL + data.href;
    drawing.setBackground(href);
  }
};

const randomCircleButton = document.getElementById("random-circle-button") as HTMLButtonElement;
const randomRectangleButton = document.getElementById("random-rect-button") as HTMLButtonElement;
const uploadTokenInput = document.getElementById("upload-token-button") as HTMLInputElement;
const uploadBackgroundInput = document.getElementById("upload-background-button") as HTMLInputElement;

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
  const r = grid.size / 2;

  const message: CreateRequestMessage = {
    type: "request_create",
    create: {
      type: "circle",
      color: getRandomColor(),
      x,
      y,
      r,
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

uploadTokenInput.addEventListener("change", (evt: Event) => {
  readFileContentsBase64(evt, (base64) => {
    if (!base64) return;
    const { x, y } = getRandomPosition();
    const w = grid.size;
    const h = grid.size;

    const message: CreateRequestMessage = {
      type: "request_create",
      create: {
        type: "image",
        data: base64,
        x,
        y,
        w,
        h,
      },
    };
    socket.send(JSON.stringify(message));
  });
});

uploadBackgroundInput.addEventListener("change", (evt: Event) => {
  readFileContentsBase64(evt, (base64) => {
    if (!base64) return;

    const message: BackgroundRequestMessage = {
      type: "request_background",
      data: base64,
    };
    socket.send(JSON.stringify(message));
  });
});
