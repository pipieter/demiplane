import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import TokenDrawView from "../../src/views/tokendraw";
import Grid from "../../src/models/grid";
import Viewport from "../../src/models/viewport";

const mockCtx = {
  translate: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(mockCtx as any);
vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,mock-canvas-data");

describe("TokenDrawView", () => {
  let viewport: Viewport;
  let grid: Grid;
  let view: TokenDrawView;
  let emitSpy: Mock;

  beforeEach(() => {
    viewport = new Viewport();
    grid = new Grid(viewport);
    view = new TokenDrawView(grid);
    vi.spyOn(grid, "getCoordinates").mockImplementation((evt: MouseEvent) => ({
      x: evt.clientX,
      y: evt.clientY,
    }));
    emitSpy = vi.spyOn(view, "emit");
  });

  const simulateDraw = (x1: number, y1: number, x2: number, y2: number) => {
    view.layer.onmousedown!(new MouseEvent("mousedown", { buttons: 1, clientX: x1, clientY: y1 }));

    view.layer.onmousemove!(new MouseEvent("mousemove", { buttons: 1, clientX: x2, clientY: y2 }));

    view.layer.onmouseup!(new MouseEvent("mouseup"));
  };

  describe("Initialization", () => {
    test("should find all required DOM elements", () => {
      expect(view.layer).toBeDefined();
      expect(view.circle).toBeDefined();
      expect(view.rectangle).toBeDefined();
      expect(view.line).toBeDefined();
      expect(view.freedraw).toBeDefined();
      expect(view.cursor).toBeDefined();

      expect(view.circleButton).toBeDefined();
      expect(view.rectangleButton).toBeDefined();
      expect(view.lineButton).toBeDefined();
      expect(view.freedrawButton).toBeDefined();
      expect(view.tokenUploadInput).toBeDefined();
      expect(view.colorInput).toBeDefined();
      expect(view.drawButtons).toBeDefined();

      expect(view.borderCheckbox).toBeDefined();
      expect(view.borderNumber).toBeDefined();
    });
  });

  describe("Input Handling", () => {
    describe("Shape Drawing", () => {
      const x1 = 10,
        y1 = 10;
      const x2 = 100,
        y2 = 100;
      const expectedWidth = x2 - x1;
      const expectedHeight = y2 - y1;

      test.each([
        {
          name: "circle",
          button: "circleButton",
          element: "circle",
          event: "circle_create",
          payload: { x: x1, y: y1, w: expectedWidth, h: expectedHeight },
        },
        {
          name: "rectangle",
          button: "rectangleButton",
          element: "rectangle",
          event: "rectangle_create",
          payload: { x: x1, y: y1, w: expectedWidth, h: expectedHeight },
        },
        {
          name: "line",
          button: "lineButton",
          element: "line",
          event: "line_create",
          payload: { x1: x1, y1: y1, x2: x2, y2: y2, stroke: 4 },
        },
      ])("should draw $name and emit $event", ({ button, element, event, payload }) => {
        const targetButton = view[button as keyof TokenDrawView] as HTMLButtonElement;
        const svgElement = view[element as keyof TokenDrawView] as SVGElement;

        targetButton.click();
        expect(targetButton.classList).toContain("selected");

        view.layer.onmousedown!(
          new MouseEvent("mousedown", {
            buttons: 1,
            clientX: x1,
            clientY: y1,
          }),
        );
        expect(svgElement.style.display).toBe("");

        view.layer.onmousemove!(
          new MouseEvent("mousemove", {
            buttons: 1,
            clientX: x2,
            clientY: y2,
          }),
        );

        view.layer.onmouseup!(new MouseEvent("mouseup"));

        expect(emitSpy).toHaveBeenCalledWith(
          event,
          expect.objectContaining({
            ...payload,
            color: view.colorInput.value,
          }),
        );

        expect(svgElement.style.display).toBe("none");
      });

      test("should be able to freedraw and emit image_create", () => {
        const start: [number, number] = [10, 200];
        const points: [number, number][] = [
          [15, 205],
          [20, 210],
        ];

        view.freedraw.getBBox = vi.fn().mockReturnValue({
          x: 10,
          y: 200,
          width: 10,
          height: 10,
        });

        view.freedrawButton.click();

        view.layer.onmousedown!(
          new MouseEvent("mousedown", {
            buttons: 1,
            clientX: start[0],
            clientY: start[1],
          }),
        );

        for (const point of points) {
          view.layer.onmousemove!(
            new MouseEvent("mousemove", {
              buttons: 1,
              clientX: point[0],
              clientY: point[1],
            }),
          );
        }

        view.layer.onmouseup!(new MouseEvent("mouseup"));

        expect(emitSpy).toHaveBeenCalledWith(
          "image_create",
          expect.objectContaining({
            base64: "data:image/png;base64,mock-canvas-data",
            x: 6,
            y: 196,
            w: 18,
            h: 18,
          }),
        );

        expect(view.freedraw.style.display).toBe("none");
      });
    });

    describe("Draw cancelling", () => {
      test("should cancel drawing when Escape is pressed", () => {
        view.circleButton.click();
        const escEvent = new KeyboardEvent("keydown", { key: "Escape" });
        document.onkeydown!(escEvent);

        expect(view.circleButton.classList.contains("selected")).toBe(false);
        expect(view.layer.style.display).toBe("none");
      });

      test("should cancel drawing when right-click is pressed", () => {
        view.circleButton.click();

        const rightClick = new MouseEvent("mousedown", { buttons: 2 });
        view.layer.onmousedown!(rightClick);

        expect(view.circleButton.classList).not.toContain("selected");
        expect(view.layer.style.display).toBe("none");
      });
    });

    describe("Border Handling", () => {
      const x1 = 0,
        y1 = 0;
      const x2 = 50,
        y2 = 50;
      const border = 6;

      test.each([
        {
          name: "circle",
          button: "circleButton",
          event: "circle_create",
        },
        {
          name: "rectangle",
          button: "rectangleButton",
          event: "rectangle_create",
        },
      ])("should emit $event with border value when checkbox is checked", ({ button, event }) => {
        const targetButton = view[button as keyof TokenDrawView] as HTMLButtonElement;

        view.borderCheckbox.checked = true;
        view.borderNumber.value = border.toString();

        targetButton.click();

        simulateDraw(x1, y1, x2, y2);

        expect(emitSpy).toHaveBeenCalledWith(
          event,
          expect.objectContaining({
            border,
            w: x2 - x1,
            h: y2 - y1,
          }),
        );
      });

      test("should emit null border when checkbox is unchecked", () => {
        view.borderCheckbox.checked = false;
        view.borderNumber.value = border.toString();

        view.rectangleButton.click();
        simulateDraw(x1, y1, x2, y1);

        expect(emitSpy).toHaveBeenCalledWith(
          "rectangle_create",
          expect.objectContaining({
            border: null,
          }),
        );
      });
    });
  });
});
