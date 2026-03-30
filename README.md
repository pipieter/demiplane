# Demiplane

Demiplane is an interactive collaborative whiteboard tool designed to be used as a lightweight virtual tabletop environment. Users can move tokens around, set a grid, and apply a background.

# Usage

Demiplane consists of a Typescript frontend server and C# backend server. The frontend server requires [Node.js](https://nodejs.org/en) 22+ and the backend server requires [.NET](https://dotnet.microsoft.com/en-us/download/dotnet) 9.0+.

## Launching the servers

The backend server can be launched by using the following command, which launches the server at port 5000.

```bash
cd server
dotnet run
```

Before launching the frontend, we will need a ``.env`` file, you can simply copy ``example.env`` and rename it to ``.env``.
Unless any special hosting changes have been made (backend not on port 5000 or URLs are being tunneled), the default ``VITE_SERVER_URL`` should work fine.

The frontend can be run in development mode using the following command, which launches an interactive server at port 5173. This refreshes the server when any change is made in the client source code.

```bash
cd client
npm install
npm run dev
```

In case you wish to run the frontend in production, you can build the files using `npm run build`.

## Discord activity

The application is designed to also work as a [Discord Activity](https://discord.com/blog/server-activities-games-voice-watch-together). For more information on how to do this, please refer to [the Discord integration documentation](./docs/DISCORD.md).
