const BACKEND_URL = "http://localhost:5000"; // TODO store this in an env file

let url;

// Check if currently being hosted in discord as a discord activity
// If so, we have to use the local /server proxy, as set-up by discord
// (see the README on how to do this)
if (location.host.includes(".discordsays.com")) {
  url = "/server";
} else {
  // This is the URL to the backend server
  url = BACKEND_URL;
}
const socket = new WebSocket(url);

socket.onmessage = function (event) {
  const messagesDiv = document.getElementById("messages") as HTMLDivElement;
  messagesDiv.innerHTML += `<div>${event.data}</div>`;
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto scroll
};

const sendButton = document.getElementById("sendButton") as HTMLButtonElement;
sendButton.onclick = function () {
  const input = document.getElementById("messageInput") as HTMLInputElement;
  socket.send(input.value);
  input.value = "";
};
