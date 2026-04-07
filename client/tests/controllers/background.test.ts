/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, test, vi } from "vitest";
import BackgroundController from "../../src/controllers/background";
import Background from "../../src/models/background";
import { util } from "../../src/util";

vi.mock("../../src/util", () => ({
  util: {
    readBase64: vi.fn(),
    createLocalImage: vi.fn(),
  },
}));

describe("BackgroundController", () => {
  let mockStore: any;
  let mockState: any;
  let mockView: any;
  let controller: BackgroundController;
  let bg: Background;

  beforeEach(() => {
    vi.clearAllMocks();

    mockStore = {
      uploadImage: vi.fn(),
      send: vi.fn(),
    };
    mockState = {
      listen: vi.fn(),
      setBackground: vi.fn(),
    };
    mockView = {
      listen: vi.fn(),
      set: vi.fn(),
    };

    controller = new BackgroundController(mockStore, mockState, mockView);
    bg = new Background();
  });

  describe("Initialization", () => {
    test("should subscribe to view and state events on initialization", () => {
      expect(mockView.listen).toHaveBeenCalledWith("background_upload", expect.any(Function));
      expect(mockState.listen).toHaveBeenCalledWith("background_change", expect.any(Function));
    });
  });

  describe("update()", () => {
    test("should call view.set with background properties", () => {
      bg.set("img.png", 500, 500);
      controller.update(bg);
      expect(mockView.set).toHaveBeenCalledWith("img.png", 500, 500);
    });
  });

  describe("upload()", () => {
    test("should process the file and update state/store", async () => {
      const mockFile = new File([], "test.png");
      vi.mocked(util.readBase64).mockResolvedValue("base64_str");
      vi.mocked(util.createLocalImage).mockResolvedValue({ href: "local_url", width: 10, height: 10 } as any);

      mockStore.uploadImage.mockResolvedValue("server_url");
      await controller.upload(mockFile);

      expect(util.readBase64).toHaveBeenCalledWith(mockFile);
      expect(mockState.setBackground).toHaveBeenCalledWith("local_url", 10, 10);
      expect(mockStore.uploadImage).toHaveBeenCalledWith("base64_str");
      expect(mockStore.send).toHaveBeenCalledWith({ type: "request_background", href: "server_url" });
    });

    test("should throw error if readBase64 fails", async () => {
      vi.mocked(util.readBase64).mockResolvedValue(null);
      await expect(controller.upload({} as File)).rejects.not.toBeNull();
    });
  });
});
