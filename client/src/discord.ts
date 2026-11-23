import { DiscordSDK } from "@discord/embedded-app-sdk";
import server from "./server";

export async function getDiscordDisplayName(): Promise<string | null> {
  if (!location.host.includes(".discordsays.com")) return null;

  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
  if (!clientId) throw new Error("VITE_DISCORD_CLIENT_ID is not configured.");

  const discordSdk = new DiscordSDK(clientId);
  await discordSdk.ready();

  const { code } = await discordSdk.commands.authorize({
    client_id: clientId,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: ["identify"],
  });

  const response = await fetch(`${server.url}/discord/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!response.ok) throw new Error(`Discord token exchange failed (${response.status}).`);

  const token: unknown = await response.json();
  if (typeof token !== "object" || token === null || !("access_token" in token)) {
    throw new Error("Discord token exchange returned an invalid response.");
  }
  const accessToken = token.access_token;
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    throw new Error("Discord token exchange returned no access token.");
  }

  const { user } = await discordSdk.commands.authenticate({ access_token: accessToken });
  return user.global_name || user.username;
}
