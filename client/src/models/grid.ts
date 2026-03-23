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

  constructor() {
    this.size = 64;
    this.offset = { x: 0, y: 0 };
  }

  public set(size: number, offsetX: number, offsetY: number) {
    this.size = size;
    this.offset.x = offsetX;
    this.offset.y = offsetY;
  }

  public getLockedCoordinates(x: number, y: number) {
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
}

export default Grid;
