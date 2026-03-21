// Check if currently being hosted in discord as a discord activity
// If so, we have to use the local /server proxy, as set-up by discord
// (see the README on how to do this)

const BackendURL = location.host.includes(".discordsays.com") ? "/server" : import.meta.env.VITE_SERVER_URL;
const socket = new WebSocket(BackendURL);

export const server = { socket, BackendURL };
