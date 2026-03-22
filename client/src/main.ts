import type { ResponseMessage } from "./messages";
import { util } from "./util";
import server from "./server";
import BackgroundView from "./views/background";
import BackgroundController from "./controllers/background";
import State from "./state";
import Store from "./store";
import TokenView from "./views/token";
import TokenController from "./controllers/token";
import TransformController from "./controllers/transform";
import TransformView from "./views/transform";
import SelectionView from "./views/selection";
import SelectionController from "./controllers/selection";
import ResizeView from "./views/resize";
import ResizeController from "./controllers/resize";
import TokenDrawView from "./views/tokendraw";
import TokenDrawController from "./controllers/tokendraw";
import GridView from "./views/grid";
import GridController from "./controllers/grid";
import HeaderView from "./views/header";
import HeaderController from "./controllers/header";

const socket = new WebSocket(server.url);
const store = new Store(server.url, socket);
const state = new State();

const grid = state.getGrid();
const viewport = state.getViewport();

const tokenView = new TokenView();
const backgroundView = new BackgroundView();
const transformView = new TransformView(grid, viewport);
const selectionView = new SelectionView();
const resizeView = new ResizeView(grid, viewport);
const tokenDrawView = new TokenDrawView(grid, viewport);
const gridView = new GridView();
const headerView = new HeaderView();

new BackgroundController(store, state, backgroundView);
new TokenController(store, state, tokenView);
new TransformController(store, state, transformView);
new SelectionController(store, state, selectionView);
new ResizeController(store, state, resizeView);
new TokenDrawController(store, state, tokenDrawView);
new GridController(store, state, gridView);
new HeaderController(store, state, headerView);

socket.onmessage = function (event) {
  const data = JSON.parse(event.data) as ResponseMessage;

  switch (data.type) {
    case "create":
      state.createToken(data.create);
      break;

    case "delete":
      state.removeTokens(data.delete);
      break;

    case "grid":
      state.setGrid(data.grid);
      break;

    case "background": {
      state.setBackground(data.background.href, data.background.width, data.background.height);
      break;
    }

    case "transform":
      state.transformToken(data.transform);
      break;

    case "sync":
      state.setGrid(data.grid);
      state.setBackground(data.background.href, data.background.width, data.background.height);
      state.createTokens(data.tokens);
      break;

    default:
      throw `Unknown message type: ${JSON.stringify(data)}`;
  }
};

const uploadTokenInput = document.getElementById("upload-token-button") as HTMLInputElement;

function getRandomPosition(): { x: number; y: number } {
  return {
    x: Math.floor(Math.random() * 1280),
    y: Math.floor(Math.random() * 600),
  };
}

uploadTokenInput.addEventListener("change", async (evt: Event) => {
  // @ts-expect-error Files should be a valid field
  const file = evt.target?.files[0];
  if (!file) {
    console.error("Could not open file.");
    return;
  }

  const base64 = await util.readBase64(file);
  if (!base64) {
    console.error("Could not read file.");
    return;
  }

  const href = await store.uploadImage(base64);
  if (!href) {
    console.error("Could not upload image to server.");
    return;
  }

  const { x, y } = getRandomPosition();
  const w = grid.size;
  const h = grid.size;

  store.send({
    type: "request_create",
    create: {
      type: "image",
      id: crypto.randomUUID(),
      href,
      x,
      y,
      w,
      h,
    },
  });
});
