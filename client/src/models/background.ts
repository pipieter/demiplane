export interface BackgroundLayer {
  id: string;
  name: string;
  href: string | null;
  width: number;
  height: number;
}

class Background {
  public layers: BackgroundLayer[];
  public selected: string | null;

  constructor() {
    this.layers = [];
    this.selected = null;
  }

  public get layer(): BackgroundLayer | null {
    return this.layers.find((layer) => layer.id === this.selected) ?? null;
  }

  public get width() {
    return this.layer?.width ?? 1024;
  }

  public get height() {
    return this.layer?.height ?? 1024;
  }

  public get href() {
    return this.layer?.href ?? null;
  }

  public set(layers: BackgroundLayer[], selected: string | null) {
    this.layers = layers;
    this.selected = selected;
  }

  public select(selected: string | null) {
    this.selected = selected;
  }
}

export default Background;
