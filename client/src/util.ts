export function readFileContentsBase64(evt: Event, callback: (base64: string | null) => void) {
  // @ts-expect-error Files should be a valid field
  const file = evt.target?.files[0];
  if (!file) {
    console.error("Could not open file.");
    return callback(null);
  }

  const reader = new FileReader();
  reader.onload = (evt) => {
    const base64 = evt.target?.result?.toString();
    if (!base64) {
      console.error("Could not read file.");
      return callback(null);
    }

    return callback(base64);
  };

  reader.readAsDataURL(file);
}
