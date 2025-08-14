// src/app/animation/blurFocusReveal.ts

export class BlurFocusReveal {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private img: HTMLImageElement;
  private W: number;
  private H: number;
  private focusRadius: number;
  private blurRadius: number;
  private pointerX: number | null = null;
  private pointerY: number | null = null;
  private displayX: number | null = null;
  private displayY: number | null = null;
  private displayRadius: number = 0;
  private easingFactor = 0.05;
  private radiusEasingFactor = 0.1;
  private animationFrameId?: number;

  constructor(
    canvas: HTMLCanvasElement,
    imgSrc: string,
    options?: { focusRadius?: number; blurRadius?: number }
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.W = canvas.width;
    this.H = canvas.height;
    this.focusRadius = options?.focusRadius ?? 60;
    this.blurRadius = options?.blurRadius ?? 5;
    this.easingFactor = 0.05;
    this.radiusEasingFactor = 0.1;

    this.img = new Image();
    this.img.crossOrigin = "anonymous";
    this.img.onload = () => {
      this.draw(); // Initial draw after image loads
      this.animate(); // Start animation loop
    };
    this.img.onerror = () => {
      console.error("Failed to load image for BlurFocusReveal animation.");
    };
    this.img.src = imgSrc;

    this.bindEvents();
  }

  private bindEvents() {
    this.canvas.addEventListener("pointermove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointerX = (e.clientX - rect.left) * (this.W / rect.width);
      this.pointerY = (e.clientY - rect.top) * (this.H / rect.height);
    });
    this.canvas.addEventListener("pointerleave", () => {
      this.pointerX = null;
      this.pointerY = null;
    });
  }

  private updatePointerPosition() {
    if (this.pointerX !== null && this.pointerY !== null) {
      if (this.displayX === null || this.displayY === null) {
        this.displayX = this.pointerX;
        this.displayY = this.pointerY;
      } else {
        this.displayX += (this.pointerX - this.displayX) * this.easingFactor;
        this.displayY += (this.pointerY - this.displayY) * this.easingFactor;
      }
      // Ease radius toward target radius when pointer is present
      this.displayRadius += (this.focusRadius - this.displayRadius) * this.radiusEasingFactor;
    } else {
      this.displayX = null;
      this.displayY = null;
      // Ease radius toward zero when pointer leaves
      this.displayRadius += (0 - this.displayRadius) * this.radiusEasingFactor;
    }
  }

  private animate = () => {
    this.updatePointerPosition();
    this.draw();
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.canvas.removeEventListener("pointermove", this.boundPointerMove);
    this.canvas.removeEventListener("pointerleave", this.boundPointerLeave);
  }

  private boundPointerMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.pointerX = (e.clientX - rect.left) * (this.W / rect.width);
    this.pointerY = (e.clientY - rect.top) * (this.H / rect.height);
  };

  private boundPointerLeave = () => {
    this.pointerX = null;
    this.pointerY = null;
  };

  private draw() {
    this.ctx.clearRect(0, 0, this.W, this.H);

    this.ctx.globalAlpha = 0.4; // subtle blurred background opacity
    this.ctx.filter = `blur(${this.blurRadius}px)`;
    this.ctx.drawImage(this.img, 0, 0, this.W, this.H);
    this.ctx.globalAlpha = 1; // reset for sharp area

    if (
      this.displayX !== null &&
      this.displayY !== null &&
      this.displayRadius > 0.5
    ) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.displayX, this.displayY, this.displayRadius, 0, Math.PI * 2);
      this.ctx.clip();

      this.ctx.filter = "none";
      this.ctx.drawImage(this.img, 0, 0, this.W, this.H);
      this.ctx.restore();

      this.ctx.beginPath();
      this.ctx.arc(this.displayX, this.displayY, this.displayRadius, 0, Math.PI * 2);
      this.ctx.strokeStyle = "rgba(225, 92, 92, 0.5)";
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
    }
  }
}
