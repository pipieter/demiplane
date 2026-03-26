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
  const blob = base64ToBlob(base64);
  const href = URL.createObjectURL(blob);
  const { width, height } = await getImageFromURLDimensions(href);

  return { href, width, height };
}

export const util = { readBase64, mouseOnElement, createLocalImage };
