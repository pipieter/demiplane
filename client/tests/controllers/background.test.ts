/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, test, vi } from "vitest";
import BackgroundController from "../../src/controllers/background";
import Store from "../../src/store";
import State from "../../src/state";
import BackgroundView from "../../src/views/background";
import { util } from "../../src/util";

vi.mock("../../src/store");
vi.mock("../../src/state");
vi.mock("../../src/views/background");
vi.mock("../../src/util");

describe("BackgroundController", () => {
  let store: Store;
  let state: State;
  let view: BackgroundView;
  let controller: BackgroundController;

  beforeEach(() => {
    vi.clearAllMocks();

    store = new Store("ws://test.com");
    state = new State();
    view = new BackgroundView();

    controller = new BackgroundController(store, state, view);
  });

  describe("Initialization", () => {
    test("should subscribe to view and state events", () => {
      expect(view.listen).toHaveBeenCalledWith("background_upload", expect.any(Function));
      expect(state.listen).toHaveBeenCalledWith("background_change", expect.any(Function));
    });
  });

  describe("View Listeners", () => {
    test("background_upload", async () => {
      vi.mocked(util.readBase64).mockResolvedValue("base64");
      vi.mocked(util.createLocalImage).mockResolvedValue({ href: "local", width: 1, height: 2 } as any);
      vi.mocked(store.uploadImage).mockResolvedValue("server_href");

      await controller.upload(new File([], "test.png"));

      expect(state.setBackground).toHaveBeenCalledWith("local", 1, 2);
      expect(store.send).toHaveBeenCalledWith({
        type: "request_background",
        href: "server_href",
      });
    });
  });

  describe("State Listeners", () => {
    test("background_change - valid file", () => {
      controller.update({ href: "new.png", width: 10, height: 20 } as any);
      expect(view.set).toHaveBeenCalledWith("new.png", 10, 20);
    });

    test("background_change - invalid file", async () => {
      vi.mocked(util.readBase64).mockResolvedValue(null);

      await expect(controller.upload(new File([], "broken.png"))).rejects.toBe("Could not read file data.");

      expect(state.setBackground).not.toHaveBeenCalled();
      expect(store.uploadImage).not.toHaveBeenCalled();
    });
  });
});
