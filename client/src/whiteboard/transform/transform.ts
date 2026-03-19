function set(id: string, x: number, y: number, w: number, h: number) {
  const element = document.getElementById(id) as unknown as SVGGraphicsElement;

  if (element.tagName === "ellipse") {
    element.setAttribute("cx", (x + w / 2).toString());
    element.setAttribute("cy", (y + h / 2).toString());
    element.setAttribute("rx", (w / 2).toString());
    element.setAttribute("ry", (h / 2).toString());
  } else {
    element.setAttribute("x", x.toString());
    element.setAttribute("y", y.toString());
    element.setAttribute("width", w.toString());
    element.setAttribute("height", h.toString());
  }
}

export const transform = { set };
