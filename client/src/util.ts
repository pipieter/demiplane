async function readBase64(file: File): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result?.toString() ?? null);
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsDataURL(file);
  });
}

function mouseOnElement(e: MouseEvent, element: Element): boolean {
  const { left, right, top, bottom } = element.getBoundingClientRect();

  return e.clientX >= left && e.clientX <= right && e.clientY >= top && e.clientY <= bottom;
}

function rotatePoint2D(point: { x: number; y: number }, origin: { x: number; y: number }, degrees: number) {
  const radians = (degrees * Math.PI) / 180;
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);

  // Move the point to the center
  const mx = point.x - origin.x;
  const my = point.y - origin.y;

  // Rotate
  const rx = mx * cos - my * sin;
  const ry = mx * sin + my * cos;

  // Move it back
  const x = rx + origin.x;
  const y = ry + origin.y;

  return { x, y };
}

export const util = { readBase64, mouseOnElement, rotatePoint2D };
