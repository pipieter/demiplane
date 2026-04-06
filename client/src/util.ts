import server from "./server";

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

function base64ToBlob(base64: string): Blob {
  const [meta, data] = base64.split(",");
  const contentType = meta.split(":")[1].split(";")[0];
  const binary = atob(data);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: contentType });
}

async function getImageFromURLDimensions(url: string) {
  function loadImage(url: string) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image failed to load"));
      img.src = url;
      return img;
    });
  }

  const image = (await loadImage(url)) as HTMLImageElement;
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  return { width, height };
}

async function createLocalImage(base64: string) {
  if (base64.length >= server.maxFileSize) {
    alert("File size too big!");
    throw "File size too big!";
  }

  const blob = base64ToBlob(base64);
  const href = URL.createObjectURL(blob);
  const { width, height } = await getImageFromURLDimensions(href);

  return { href, width, height };
}

function isUserTyping(): boolean {
  const el = document.activeElement;
  if (!el) return false;

  const isInput = el.tagName === "INPUT" || el.tagName === "TEXTAREA";
  const isContentEditable = (el as HTMLElement).isContentEditable;

  return isInput || isContentEditable;
}

function rasterizeLine(
  points: [number, number][],
  offsetX: number,
  offsetY: number,
  width: number,
  height: number,
  lineWidth: number,
  color: string,
) {
  const canvas = document.createElement("canvas");

  // A small addition is required to ensure that the line doesn't get cut off at the borders
  canvas.width = width + 2 * lineWidth;
  canvas.height = height + 2 * lineWidth;

  const ctx = canvas.getContext("2d")!;
  ctx.translate(-offsetX + lineWidth, -offsetY + lineWidth);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineWidth = lineWidth;

  if (points.length > 1) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();
  }

  const base64 = canvas.toDataURL();
  // Because the image is slightly larger due to the line padding, a small shift is required
  const targetX = offsetX - lineWidth;
  const targetY = offsetY - lineWidth;
  const targetWidth = width + 2 * lineWidth;
  const targetHeight = height + 2 * lineWidth;

  return {
    base64,
    x: targetX,
    y: targetY,
    w: targetWidth,
    h: targetHeight,
  };
}

export const util = { readBase64, mouseOnElement, isUserTyping, createLocalImage, rasterizeLine };
