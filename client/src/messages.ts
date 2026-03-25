import type { GridData } from "./models/grid";
import type { Token } from "./models/token";
import type { Transform } from "./models/transform";
import type { User } from "./models/user";

/** Request to sync the board state */
export interface SyncRequestMessage {
  type: "request_sync";
  bearer: string | null;
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
  bearer: string;
  me: User;
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
    bearer: string;
    name: string;
    color: string;
  };
}

/** Set a user's new data, either by change or by joining. */
export interface UserChangeResponseMessage {
  type: "user_change";
  user: User;
}

export type RequestMessage =
  | SyncRequestMessage
  | CreateRequestMessage
  | DeleteRequestMessage
  | TransformRequestMessage
  | GridRequestMessage
  | BackgroundRequestMessage
  | UserChangeRequestMessage;
export type ResponseMessage =
  | SyncResponseMessage
  | CreateResponseMessage
  | DeleteResponseMessage
  | TransformResponseMessage
  | GridResponseMessage
  | BackgroundResponseMessage
  | UserChangeResponseMessage;
