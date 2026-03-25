// Check if currently being hosted in discord as a discord activity
// If so, we have to use the local /server proxy, as set-up by discord
// (see the README on how to do this)

const url = location.host.includes(".discordsays.com") ? "/server" : import.meta.env.VITE_SERVER_URL;

/**
 * Create a full URL from an href. If the href starts with "/" (e.g. "/images/abc.png"), then
 * it's a local URL for the server. Otherwise it's an external asset (e.g. "https://www.example.com").
 */
function fullURL(href: string) {
  if (href.startsWith("/")) {
    return url + href;
  }
  return href;
}

const server = { url, fullURL };
export default server;
