import type Viewport from "./viewport";

export interface GridData {
  size: number;
  offset: {
    x: number;
    y: number;
  };
}

class Grid {
  public size: number;
  public offset: {
    x: number;
    y: number;
  };
  public defaultLocked: boolean;
  public viewport: Viewport;

  constructor(viewport: Viewport) {
    this.size = 64;
    this.offset = { x: 0, y: 0 };
    this.viewport = viewport;
    this.defaultLocked = false;
  }

  public set(size: number, offsetX: number, offsetY: number) {
    this.size = size;
    this.offset.x = offsetX;
    this.offset.y = offsetY;
  }

  private getLockedCoordinates(x: number, y: number) {
    const snap = (value: number, offset: number) => {
      const local = value - offset;
      const start = Math.floor(local / this.size) * this.size + offset;
      const end = start + this.size;
      // threshold of 1/4th ensures equal snapping behavior.
      const snapThreshold = this.size / 4;

      if (local < start + snapThreshold) return start;
      if (local > end - snapThreshold) return end;
      return start + this.size / 2;
    };

    const snappedX = snap(x, this.offset.x);
    const snappedY = snap(y, this.offset.y);

    return {
      x: snappedX,
      y: snappedY,
    };
  }

  public getCoordinates(evt: MouseEvent, enableGridLock: boolean = true) {
    const { x, y } = this.viewport.getTranslatedCoords(evt.offsetX, evt.offsetY);

    if (!enableGridLock) {
      return { x, y };
    }

    let gridLocked = this.defaultLocked;
    if (evt.shiftKey) {
      gridLocked = !gridLocked; // Inverse behavior on shift
    }

    if (gridLocked) {
      return this.getLockedCoordinates(x, y);
    }

    return { x, y };
  }
}

export default Grid;
