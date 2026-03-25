// Check if currently being hosted in discord as a discord activity
// If so, we have to use the local /server proxy, as set-up by discord
// (see the README on how to do this)

const url = location.host.includes(".discordsays.com") ? "/server" : import.meta.env.VITE_SERVER_URL;

function fullURL(href: string) {
  if (href.startsWith("/")) {
    return url + href;
  }
  return href;
}

const server = { url, fullURL };
export default server;
