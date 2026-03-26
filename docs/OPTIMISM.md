# Optimistic messages

The client is very optimistic with its state changes. When a message is sent to the server to update the global state, it typically performs some validation, updates its state, and then broadcasts the new state to all the connected users. In order to improve efficiency, a client performs this change immediately locally and sends the state change message afterwards. It optimistically assumes that the state change will go through, and thus eagerly changes its local state. In case an error does occur, the client sends a sync request to synchronize its state with the server.

The benefit of this approach is the user views their updates immediately, improving the user experience. It is assumed that errors happen infrequently, and only in fringe cases (e.g. two different users deleting the same token in quick succession). In these cases, the states could be out of sync and a resynchronization is required.

## Transforming and deleting

Normally the server validates all interactions to ensure they can happen. There is one exception to this rule, namely regarding the transforms and deletions of tokens.

It is possible for a token to be created and then immediately be moved or deleted without the server having had the time to create it in the global state. For example, for image token and freedraw token creation, which takes several steps, it's possible for the transform message to arrive before the creation message. In order to create a freedraw token to the board, the following steps are taken:

1. The user draws the line.
2. The line gets rasterized to a PNG.
3. The client locally adds the token to the drawing board
4. The rasterized image gets uploaded to the server through a POST request.
5. The rasterized image is saved on the server, and the href for the image is sent back.
6. The client uploads a new token to the server using the href.

If between steps 4 and 5 (i.e. while the token is still uploading) the user begins moving the local token, an error occurs. The movement sends a transform message of the token to the server, but the token has not been uploaded to the server yet. This would result in an error thrown by the server as the token cannot be found, even though local state of the token is correct. Uploading the image can take a while, particularly for large images, meaning that in order to improve the user experience creating the token locally until after the image is uploaded is not an option.

In order to handle this issue, the server keeps track of the most recent message related to each token. If the token does not exist for a message, it assumes that the token will be created later on. When this token does end up being created, it also broadcasts the most recent message associated with that object. In case this token is not created within five seconds, the message is deleted and ignored.
