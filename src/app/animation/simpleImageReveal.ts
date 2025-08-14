export class SimpleImageReveal {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private img = new Image();

  constructor(canvas: HTMLCanvasElement, imgSrc: string) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.img.crossOrigin = 'anonymous';
    this.img.onload = () => this.drawImage();
    this.img.src = imgSrc;
  }

  private drawImage() {
    const { width: W, height: H } = this.canvas;
    this.ctx.clearRect(0, 0, W, H);
    this.ctx.drawImage(this.img, 0, 0, W, H);
  }
}
