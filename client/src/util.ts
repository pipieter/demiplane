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

function pointerOnElement(evt: PointerEvent, element: Element): boolean {
  const { left, right, top, bottom } = element.getBoundingClientRect();

  return evt.clientX >= left && evt.clientX <= right && evt.clientY >= top && evt.clientY <= bottom;
}

export const util = { readBase64, pointerOnElement };
