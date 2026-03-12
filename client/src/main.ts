import { drawing } from "./drawing";
import { grid, setGrid } from "./grid";
import type { CreateRequestMessage, ResponseMessage } from "./messages";
import socket from "./socket";

drawing.initialize();

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
const uploadTokenInput = document.getElementById("upload-token-button") as HTMLInputElement;

randomCircleButton.onclick = () => {
  const x = Math.floor(Math.random() * 1280);
  const y = Math.floor(Math.random() * 600);
  const r = grid.size / 2;

  const colors = ["red", "blue", "orange", "yellow", "green", "purple", "pink", "black", "cyan", "lime"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  const message: CreateRequestMessage = {
    type: "request_create",
    create: {
      type: "circle",
      x,
      y,
      r,
      color,
    },
  };
  socket.send(JSON.stringify(message));
};

uploadTokenInput.addEventListener("change", (evt: Event) => {
  // @ts-expect-error Files should be a valid field
  const file = evt.target?.files[0];
  if (!file) {
    console.error("Could not open file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (evt) => {
    const base64 = evt.target?.result?.toString();
    if (!base64) {
      console.error("Could not read file.");
      return;
    }

    const x = Math.floor(Math.random() * 1280);
    const y = Math.floor(Math.random() * 600);
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
  };

  reader.readAsDataURL(file);
});
