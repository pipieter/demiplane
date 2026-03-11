import drawing from "./drawing";
import type { ResponseMessage } from "./messages";
import socket from "./socket";

socket.onmessage = function (event) {
  const data = JSON.parse(event.data) as ResponseMessage;

  if (data.type === "create") {
    drawing.createToken(data.create);
  } else if (data.type === "move") {
    const id = data.move.id;
    const x = data.move.x;
    const y = data.move.y;
    drawing.move(id, x, y);
  }
};

const sendButton = document.getElementById("sendButton") as HTMLButtonElement;
sendButton.onclick = function () {
  const input = document.getElementById("messageInput") as HTMLInputElement;
  socket.send(input.value);
  input.value = "";
};

drawing.initialize();

const randomCircleButton = document.getElementById("random-circle-button") as HTMLButtonElement;
randomCircleButton.onclick = () => {
  const x = Math.floor(Math.random() * 1280);
  const y = Math.floor(Math.random() * 600);
  const r = Math.floor(Math.random() * 25) + 25;

  const colors = ["red", "blue", "orange", "yellow", "green", "purple", "pink", "black", "cyan", "lime"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  const message = {
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
