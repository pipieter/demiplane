class Background {
  public href: string | null;
  public width: number;
  public height: number;

  constructor() {
    this.href = null;
    this.width = 1024;
    this.height = 1024;
  }

  public set(href: string | null, width: number, height: number) {
    this.href = href;
    this.width = width;
    this.height = height;
  }
}

export default Background;
