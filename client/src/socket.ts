// Check if currently being hosted in discord as a discord activity
// If so, we have to use the local /server proxy, as set-up by discord
// (see the README on how to do this)
let url;
if (location.host.includes(".discordsays.com")) {
  url = "/server";
} else {
  // This is the URL to the backend server
  url = import.meta.env.VITE_SERVER_URL;
  console.log(url);
}
const socket = new WebSocket(url);

export default socket;
