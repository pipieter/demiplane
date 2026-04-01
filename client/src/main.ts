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
import TokenDrawView from "./views/tokendraw";
import TokenDrawController from "./controllers/tokendraw";
import GridView from "./views/grid";
import GridController from "./controllers/grid";
import SidebarView from "./views/sidebar";
import SidebarController from "./controllers/sidebar";
import TokenEditView from "./views/tokenedit";
import TokenEditController from "./controllers/tokenedit";
import TokenListView from "./views/tokenlist";
import TokenListController from "./controllers/tokenlist";
import UserView from "./views/user";
import UserController from "./controllers/user";
import HoverView from "./views/hover";
import HoverController from "./controllers/hover";
import ServerStatusView from "./views/serverstatus";
import ServerStatusController from "./controllers/serverstatus";

const state = new State();
const store = new Store(server.url, state);

const grid = state.getGrid();

const tokenView = new TokenView();
const backgroundView = new BackgroundView();
const transformView = new TransformView(grid);
const selectionView = new SelectionView();
const serverStatusView = new ServerStatusView();
const tokenDrawView = new TokenDrawView(grid);
const gridView = new GridView();
const headerView = new SidebarView();
const tokenEditView = new TokenEditView();
const tokenListView = new TokenListView();
const userView = new UserView();
const hoverView = new HoverView();

new BackgroundController(store, state, backgroundView);
new TokenController(store, state, tokenView);
new TransformController(store, state, transformView);
new SelectionController(store, state, selectionView);
new ServerStatusController(store, state, serverStatusView);
new TokenDrawController(store, state, tokenDrawView);
new GridController(store, state, gridView);
new SidebarController(store, state, headerView);
new TokenEditController(store, state, tokenEditView);
new TokenListController(store, state, tokenListView);
new UserController(store, state, userView);
new HoverController(store, state, hoverView);


