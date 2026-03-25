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

function isUserTyping(): boolean {
  const el = document.activeElement;
  if (!el) return false;

  const isInput = el.tagName === "INPUT" || el.tagName === "TEXTAREA";
  const isContentEditable = (el as HTMLElement).isContentEditable;

  return isInput || isContentEditable;
}

export const util = { readBase64, mouseOnElement, isUserTyping };
