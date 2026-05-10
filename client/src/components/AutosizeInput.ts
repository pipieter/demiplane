/**
 * Create an input element that automatically resizes itself based on its current value.
 * @param value The starting input value.
 * @param minWidth The minimum width of the input element.
 * @returns
 */
export default function AutosizeInput(value: string = "", minWidth: number = 4) {
  const input = document.createElement("input");
  input.value = value;

  const width = Math.max(value.length, minWidth);
  input.style.width = `${width}ch`;

  input.addEventListener("input", () => {
    const width = Math.max(input.value.length, minWidth);
    input.style.width = `${width}ch`;
  });
  return input;
}
