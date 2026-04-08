class RulerView {
    public readonly layer: SVGSVGElement;

    constructor() {
        this.layer = document.getElementById("ruler-layer") as unknown as SVGSVGElement;
    }
}

export default RulerView;