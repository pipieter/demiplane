import type { GridData } from "./models/grid";
import type { Token } from "./models/token";
import type { Transform } from "./models/transform";
import type { User } from "./models/user";

/** An error has occurred somewhere */
export interface ErrorResponseMessage {
  type: "error";
  message: string;
}

/** Request to sync the board state */
export interface SyncRequestMessage {
  type: "request_sync";
  secret: string | null;
}

/** Sync the current board state */
export interface SyncResponseMessage {
  type: "sync";
  background: {
    href: string | null;
    width: number;
    height: number;
  };
  grid: GridData;
  tokens: Token[];
  users: User[];
  secret: string;
  me: User;
}

export interface Duplicate {
  parentId: string;
  childId: string;
}

/** Request to duplicate a token on the whiteboard */
export interface DuplicateRequestMessage {
  type: "request_duplicate";
  duplicate: Duplicate[];
}

/** Request to create a token on the whiteboard */
export interface CreateRequestMessage {
  type: "request_create";
  create: Token;
}

/** Create a token on the whiteboard */
export interface CreateResponseMessage {
  type: "create";
  create: Token;
}

/** Request to delete a token on the whiteboard */
export interface DeleteRequestMessage {
  type: "request_delete";
  delete: string[];
}

/** Delete a token on the whiteboard */
export interface DeleteResponseMessage {
  type: "delete";
  delete: string[];
}

/** Request to resize a token on the whiteboard */
export interface TransformRequestMessage {
  type: "request_transform";
  transform: Transform;
}

/** Resize a token on the board */
export interface TransformResponseMessage {
  type: "transform";
  transform: Transform;
}

/** Request the grid to be adjusted */
export interface GridRequestMessage {
  type: "request_grid";
  grid: GridData;
}

/** Adjust the grid */
export interface GridResponseMessage {
  type: "grid";
  grid: GridData;
}

/** Request to change the background image */
export interface BackgroundRequestMessage {
  type: "request_background";
  href: string;
}

/** Set the background image */
export interface BackgroundResponseMessage {
  type: "background";
  background: {
    href: string | null;
    width: number;
    height: number;
  };
}

/** Request to update your user */
export interface UserChangeRequestMessage {
  type: "request_user_change";
  user: {
    secret: string;
    name: string;
    color: string;
  };
}

/** Set a user's new data, either by change or by joining. */
export interface UserChangeResponseMessage {
  type: "user_change";
  user: User;
}

/** Remove a user due to disconnection */
export interface UserDisconnectResponseMessage {
  type: "user_disconnect";
  userId: string;
}

export type RequestMessage =
  | SyncRequestMessage
  | CreateRequestMessage
  | DuplicateRequestMessage
  | DeleteRequestMessage
  | TransformRequestMessage
  | GridRequestMessage
  | BackgroundRequestMessage
  | UserChangeRequestMessage;
export type ResponseMessage =
  | ErrorResponseMessage
  | SyncResponseMessage
  | CreateResponseMessage
  | DeleteResponseMessage
  | TransformResponseMessage
  | GridResponseMessage
  | BackgroundResponseMessage
  | UserChangeResponseMessage
  | UserDisconnectResponseMessage;
