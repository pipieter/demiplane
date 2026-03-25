# Server Synchronization
This document describes how the client & server synchronize their state.

## Synchronization process
When a client connects to the webhook server, it sends a `sync_request` message holding their secret token.
Their secret-token is a ``string`` or ``null``.
The server will then check the token and respond with a `sync` message, which holds the current board-state.

If the user's secret-token is null or unknown to the server, the server will generate a new user with a new secret-token, and send that back in the `sync` message. The client should then store this token for future use.
If the user's secret-token is known to the server, the server will just send that same secret-token back.

The client that connected will receive a ``sync`` message upon a ``sync_request``, all other connected clients will be sent a ``user_change`` message to notify them of the new user that has connected.