import drawing from "./drawing";
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
