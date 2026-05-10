import type { BackgroundLayer } from "../models/background";

/** Request to add a background layer */
export interface BackgroundAddLayerRequestMessage {
  type: "request_background_add_layer";
  layer: BackgroundLayer;
}

/** Add a background layer */
export interface BackgroundAddLayerResponseMessage {
  type: "background_add_layer";
  layer: BackgroundLayer;
}

/** Request to select a background layer */
export interface BackgroundSelectLayerRequestMessage {
  type: "request_background_select_layer";
  id: string;
}

/** Select a background layer */
export interface BackgroundSelectLayerResponseMessage {
  type: "background_select_layer";
  id: string;
}

/** Request to rename a background layer */
export interface BackgroundRenameLayerRequestMessage {
  type: "request_background_rename_layer";
  id: string;
  name: string;
}

/** Rename a background layer */
export interface BackgroundRenameLayerResponseMessage {
  type: "background_select_layer";
  id: string;
  name: string;
}

/** Request to delete a background layer */
export interface BackgroundDeleteLayerRequestMessage {
  type: "request_background_delete_layer";
  id: string;
}

/** Select a background layer */
export interface BackgroundDeleteLayerResponseMessage {
  type: "background_delete_layer";
  id: string;
}

export type BackgroundRequestMessage =
  | BackgroundAddLayerRequestMessage
  | BackgroundSelectLayerRequestMessage
  | BackgroundRenameLayerRequestMessage
  | BackgroundDeleteLayerRequestMessage;

export type BackgroundResponseMessage =
  | BackgroundAddLayerResponseMessage
  | BackgroundSelectLayerResponseMessage
  | BackgroundRenameLayerResponseMessage
  | BackgroundDeleteLayerResponseMessage;
