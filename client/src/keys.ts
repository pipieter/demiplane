export let shift = false;

window.addEventListener("keydown", (e) => {
    if (e.key === "Shift") shift = true;
});

window.addEventListener("keyup", (e) => {
    if (e.key === "Shift") shift = false;
});