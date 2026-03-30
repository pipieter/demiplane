import type { Token, TokenCircle } from "./models/token";
import type { Point } from "./models/transform";

type Line = [Point, Point];

function rotatePoint(point: Point, center: Point, angleDeg: number) {
  const angle = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const dx = point.x - center.x;
  const dy = point.y - center.y;

  const x = center.x + dx * cos - dy * sin;
  const y = center.y + dx * sin + dy * cos;

  return { x, y };
}

function getRectangleEdges(x: number, y: number, w: number, h: number, r: number): Line[] {
  const center = { x: x + w / 2, y: y + h / 2 };
  const p1 = { x: x + 0, y: y + 0 };
  const p2 = { x: x + w, y: y + 0 };
  const p3 = { x: x + 0, y: y + h };
  const p4 = { x: x + w, y: y + h };

  const r1 = rotatePoint(p1, center, r);
  const r2 = rotatePoint(p2, center, r);
  const r3 = rotatePoint(p3, center, r);
  const r4 = rotatePoint(p4, center, r);

  return [
    [r1, r2],
    [r2, r3],
    [r3, r4],
    [r4, r1],
  ];
}

/// Liang-Barsky is an algorithm to detect the intersection between a line and a rectangle
/// https://en.wikipedia.org/wiki/Liang%E2%80%93Barsky_algorithm
/// https://gist.github.com/ChickenProp/3194723
/// https://gist.github.com/w8r/7b701519a7c5b4840bec4609ceab3171 (code taken from here)
function LiangBarsky(rect: DOMRect, line: Line): boolean {
  const xmin = rect.x;
  const ymin = rect.y;
  const xmax = rect.x + rect.width;
  const ymax = rect.y + rect.height;

  const x0 = line[0].x;
  const y0 = line[0].y;
  const x1 = line[1].x;
  const y1 = line[1].y;
  let t0 = 0;
  let t1 = 1;
  var dx = x1 - x0;
  let dy = y1 - y0;

  for (let edge = 0; edge < 4; edge++) {
    let p = 0;
    let q = 0;
    // Traverse through left, right, bottom, top edges.
    if (edge === 0) {
      p = -dx;
      q = -(xmin - x0);
    }
    if (edge === 1) {
      p = dx;
      q = xmax - x0;
    }
    if (edge === 2) {
      p = -dy;
      q = -(ymin - y0);
    }
    if (edge === 3) {
      p = dy;
      q = ymax - y0;
    }

    const r = q / p;

    if (p === 0 && q < 0) {
      return false;
    }

    if (p < 0) {
      if (r > t1) {
        return false;
      } else if (r > t0) {
        t0 = r;
      }
    } else if (p > 0) {
      if (r < t0) {
        return false;
      } else if (r < t1) {
        t1 = r;
      }
    }
  }

  return true;
}

// https://www.jeffreythompson.org/collision-detection/circle-rect.php
function circleRectangleIntersection(
  cx: number,
  cy: number,
  cr: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
) {
  // temporary variables to set edges for testing
  let testX = cx;
  let testY = cy;

  // which edge is closest?
  if (cx < rx)
    testX = rx; // test left edge
  else if (cx > rx + rw) testX = rx + rw; // right edge
  if (cy < ry)
    testY = ry; // top edge
  else if (cy > ry + rh) testY = ry + rh; // bottom edge

  // get distance from closest edges
  let distX = cx - testX;
  let distY = cy - testY;
  let distance = Math.sqrt(distX * distX + distY * distY);

  // if the distance is less than the radius, collision!
  if (distance <= cr) {
    return true;
  }
  return false;
}

function rectangleEllipseIntersection(rect: DOMRect, token: TokenCircle): boolean {
  if (token.w <= 0 || token.h <= 0) return false;

  /* In order to calculate the intersection between a rotated circle and an axis-aligned
   * rectangle, we first transform the ellipse to the unit circle and apply the same
   * transformations to the edges of the rectangle. We then check if the transformed
   * edges of the rectangle intersect with the unit circle.
   *
   * Transforming the ellipse to the unit circle involves the following steps:
   * 1. Translate the ellipse to (0, 0)
   * 2. Rotate the ellipse so it has no rotation/angle
   * 3. Scale the ellipse so it becomes a circle with length 1
   */

  // TO DO Fix this

  const corners = [
    { x: rect.left, y: rect.top },
    { x: rect.right, y: rect.top },
    { x: rect.right, y: rect.bottom },
    { x: rect.left, y: rect.bottom },
  ];

  // Step 1: translate the ellipse to (0, 0)
  {
    const cx = token.x + token.w / 2;
    const cy = token.y + token.h / 2;

    for (const corner of corners) {
      corner.x -= cx;
      corner.y -= cy;
    }
  }

  // Step 2: rotate the ellipse so it has no angle
  {
    for (let i = 0; i < corners.length; i++) {
      corners[i] = rotatePoint(corners[i], { x: 0, y: 0 }, -token.r);
    }
  }

  // Step 3: scale the ellipse
  {
    for (const corner of corners) {
      // TODO scaling should be done on the axis through (0, 0) and (cos(-r), sin(-r))
      corner.x /= token.w / 2;
      corner.y /= token.h / 2;
    }
  }
  // Step 4: rotate the points back so they're axis aligned
  {
    for (let i = 0; i < corners.length; i++) {
      corners[i] = rotatePoint(corners[i], { x: 0, y: 0 }, token.r);
    }
  }

  // Step 5: check for intersections
  // https://stackoverflow.com/a/402010
  const xmin = Math.min(...corners.map((corner) => corner.x));
  const ymin = Math.min(...corners.map((corner) => corner.y));
  const xmax = Math.max(...corners.map((corner) => corner.x));
  const ymax = Math.max(...corners.map((corner) => corner.y));

  const rx = xmin;
  const ry = ymin;
  const rw = xmax - xmin;
  const rh = ymax - ymin;

  const cx = 0;
  const cy = 0;
  const cr = 1;

  return circleRectangleIntersection(cx, cy, cr, rx, ry, rw, rh);
}

function overlap(rect: DOMRect, token: Token): boolean {
  switch (token.type) {
    case "image":
    case "rectangle": {
      const x = token.x;
      const y = token.y;
      const w = token.w;
      const h = token.h;
      const r = token.r;
      const edges = getRectangleEdges(x, y, w, h, r);
      return edges.some((edge) => LiangBarsky(rect, edge));
    }
    case "line": {
      const p1: Point = { x: token.x, y: token.y };
      const p2: Point = { x: token.x + token.w, y: token.y + token.h };
      return LiangBarsky(rect, [p1, p2]);
    }
    case "circle": {
      return rectangleEllipseIntersection(rect, token);
    }
  }

  return false;
}

const calc = { overlap };
export default calc;
