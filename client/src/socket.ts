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

export default socket;
