// src/app/animation/textheatReveal.ts
export class TextHeatReveal {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private W: number;
  private H: number;
  private res: number;
  private characters: string;
  private fontSize: number;
  private fontFamily: string;
  private words: string[];
  private heat: {
    current: Float32Array;
    lastTime: number;
    active: boolean;
    maxValue: number;
  };
  private P: any;
  private scrambleInterval: number;
  private scrambleAmount: number;
  private scrambleActive: boolean;
  private coverCanvas: HTMLCanvasElement;
  private coverCtx: CanvasRenderingContext2D;
  private coverData: ImageData | null;
  private staticCanvas: HTMLCanvasElement;
  private staticCtx: CanvasRenderingContext2D;
  private staticRendered: boolean;
  private lastFrameTime: number;
  private frameCount: number;
  private fps: number;
  private lowPerformanceMode: boolean;
  private charGrid: {
    x: number;
    y: number;
    char: string;
    weight: number;
    brightness: number;
    isWordChar: boolean;
  }[];
  private img: HTMLImageElement;
  private scrambleTimer: any;
  private _lastEvt: number | null;
  private _lastX: number | null;
  private _lastY: number | null;

  constructor(
    canvas: HTMLCanvasElement,
    imgSrc: string,
    options: {
      resolution?: number;
      characters?: string;
      fontSize?: number;
      fontFamily?: string;
      words?: string[];
      gridSize?: number;
      textWeight?: number;
      contrast?: number;
      minBrightness?: number;
      textOpacity?: number;
      strength?: number;
      diffusion?: number;
      decay?: number;
      threshold?: number;
      imageBrightness?: number;
      imageContrast?: number;
      scrambleInterval?: number;
      scrambleAmount?: number;
    } = {}
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    this.W = canvas.width;
    this.H = canvas.height;

    this.res = options.resolution || 96;
    this.characters = options.characters || "GSAPHEATEFFECT!@#$%&*()_+";
    this.fontSize = options.fontSize || 10;
    this.fontFamily = options.fontFamily || "monospace";
    this.words = options.words || [
      "CREATE",
      "INSPIRE",
      "DESIGN",
      "IMAGINE",
      "VISION",
      "IDEA",
      "DREAM",
    ];

    this.heat = {
      current: new Float32Array(this.res * this.res).fill(0),
      lastTime: 0,
      active: false,
      maxValue: 0,
    };

    this.P = {
      grid: {
        size: options.gridSize || 20,
        weight: options.textWeight || 1,
        contrast: options.contrast || 1.2,
        minBrightness: options.minBrightness || 0.25,
        textOpacity: options.textOpacity || 0.85,
      },
      effect: {
        strength: options.strength || 16.5,
        diffusion: options.diffusion || 0.92,
        decay: options.decay || 0.995, // slower fade for continuous color reveal
        threshold: options.threshold || 0.04,
      },
      image: {
        brightness: options.imageBrightness || 1.2,
        contrast: options.imageContrast || 1.3,
      },
    };

    this.scrambleInterval = options.scrambleInterval || 500;
    this.scrambleAmount = options.scrambleAmount || 0.08;
    this.scrambleActive = true;

    this.coverCanvas = document.createElement("canvas");
    this.coverCanvas.width = this.W;
    this.coverCanvas.height = this.H;
    this.coverCtx = this.coverCanvas.getContext("2d")!;

    this.coverData = null;

    this.staticCanvas = document.createElement("canvas");
    this.staticCanvas.width = this.W;
    this.staticCanvas.height = this.H;
    this.staticCtx = this.staticCanvas.getContext("2d")!;

    this.staticRendered = false;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    this.lowPerformanceMode = false;
    this.charGrid = [];

    this._lastEvt = null;
    this._lastX = null;
    this._lastY = null;

    this.img = new Image();
    this.img.crossOrigin = "anonymous";

    this.img.onload = () => this._prepareCover();
    this.img.onerror = () => {
      this.img.src =
        "https://assets.codepen.io/7558/bw-spheres-003.jpg"; // fallback image
    };

    this.img.src = imgSrc;
  }

  private _prepareCover() {
    this.coverCtx.fillStyle = "black";
    this.coverCtx.fillRect(0, 0, this.W, this.H);

    const scale = Math.max(this.W / this.img.width, this.H / this.img.height);
    const sw = this.img.width * scale;
    const sh = this.img.height * scale;
    const ox = (this.W - sw) / 2;
    const oy = (this.H - sh) / 2;

    this.coverCtx.filter = `brightness(${this.P.image.brightness}) contrast(${this.P.image.contrast})`;
    this.coverCtx.drawImage(this.img, ox, oy, sw, sh);
    this.coverCtx.filter = "none";

    // Convert image to grayscale for base
    const imgData = this.coverCtx.getImageData(0, 0, this.W, this.H);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      imgData.data[i] = gray;
      imgData.data[i + 1] = gray;
      imgData.data[i + 2] = gray;
    }
    this.coverCtx.putImageData(imgData, 0, 0);

    this.coverData = this.coverCtx.getImageData(0, 0, this.W, this.H);

    this._clearHeat();
    this._generateCharGrid();
    this._placeWordsInGrid();
    this._renderStaticGrid();
    this._render();
    this._bindEvents();
    this._startScrambling();
    this._monitorPerformance();
  }

  private _clearHeat() {
    this.heat.current.fill(0);
    this.heat.lastTime = 0;
    this.heat.maxValue = 0;
  }

  private _generateCharGrid() {
    const gridSize = this.P.grid.size;
    const minBrightness = this.P.grid.minBrightness;
    this.charGrid = [];

    for (let y = 0; y < this.H; y += gridSize) {
      for (let x = 0; x < this.W; x += gridSize) {
        const pi = (Math.floor(y) * this.W + Math.floor(x)) * 4;
        let gray =
          (this.coverData!.data[pi] * 0.299 +
            this.coverData!.data[pi + 1] * 0.587 +
            this.coverData!.data[pi + 2] * 0.114) /
          255;

        gray = Math.max(
          minBrightness,
          Math.min(1, (gray - 0.5) * this.P.grid.contrast + 0.5)
        );

        const randomChar =
          this.characters.charAt(
            Math.floor(Math.random() * this.characters.length)
          );

        this.charGrid.push({
          x,
          y,
          char: randomChar,
          weight: gray * this.P.grid.weight,
          brightness: gray,
          isWordChar: false,
        });
      }
    }
  }

  private _placeWordsInGrid() {
    const gridSize = this.P.grid.size;
    const cols = Math.floor(this.W / gridSize);
    const rows = Math.floor(this.H / gridSize);

    this.charGrid.forEach((cell) => {
      cell.isWordChar = false;
    });

    this.words.forEach((word) => {
      const placementCount = Math.max(1, Math.floor(Math.random() * 2) + 1);

      for (let placement = 0; placement < placementCount; placement++) {
        const direction = Math.floor(Math.random() * 3);
        let startX, startY, valid;
        let attempts = 0;

        while (!valid && attempts < 20) {
          attempts++;
          startX = Math.floor(Math.random() * cols);
          startY = Math.floor(Math.random() * rows);
          valid = true;

          if (direction === 0) {
            if (startX + word.length > cols) valid = false;
          } else if (direction === 1) {
            if (startY + word.length > rows) valid = false;
          } else {
            if (startX + word.length > cols || startY + word.length > rows)
              valid = false;
          }

          if (valid) {
            for (let i = 0; i < word.length; i++) {
              let x, y;
              if (direction === 0) {
                x = (startX + i) * gridSize;
                y = startY * gridSize;
              } else if (direction === 1) {
                x = startX * gridSize;
                y = (startY + i) * gridSize;
              } else {
                x = (startX + i) * gridSize;
                y = (startY + i) * gridSize;
              }

              const index = this.charGrid.findIndex(
                (cell) => cell.x === x && cell.y === y
              );

              if (index !== -1) {
                this.charGrid[index].char = word[i];
                this.charGrid[index].isWordChar = true;
                this.charGrid[index].brightness = Math.max(
                  this.charGrid[index].brightness,
                  0.65
                );
              }
            }
          }
        }
      }
    });
  }

  private _renderStaticGrid() {
    this.staticCtx.clearRect(0, 0, this.W, this.H);
    this.staticCtx.fillStyle = "black";
    this.staticCtx.fillRect(0, 0, this.W, this.H);

    this.charGrid.forEach((cell) => {
      const { x, y, char, brightness, isWordChar } = cell;
      const sizeFactor = isWordChar ? 0.8 : 0.5;
      const size = this.fontSize * (sizeFactor + brightness * 0.8);
      this.staticCtx.font = `${isWordChar ? "bold" : ""} ${size}px ${
        this.fontFamily
      }`;
      const colorFactor = isWordChar ? 1.3 : 1.1;
      const finalBrightness =
        Math.min(1, brightness * colorFactor) * this.P.grid.textOpacity;
      this.staticCtx.fillStyle = `rgba(255,255,255,${finalBrightness})`;
      this.staticCtx.textAlign = "center";
      this.staticCtx.textBaseline = "middle";
      this.staticCtx.fillText(char, x + this.P.grid.size / 2, y + this.P.grid.size / 2);
    });

    this.staticRendered = true;
  }

  private _render() {
    this.ctx.clearRect(0, 0, this.W, this.H);

    // Draw grayscale image beneath grid with low opacity
    this.ctx.globalAlpha = 0.2; // Adjust base image opacity here
    this.ctx.drawImage(this.coverCanvas, 0, 0);
    this.ctx.globalAlpha = 1;

    // Draw static grid text on top
    this.ctx.drawImage(this.staticCanvas, 0, 0);

    // Draw color reveal clipped regions on top
    if (this.heat.active || this.heat.maxValue > 0) {
      const gridSize = this.P.grid.size;
      const threshold = this.P.effect.threshold;

      for (let y = 0; y < this.H; y += gridSize) {
        for (let x = 0; x < this.W; x += gridSize) {
          const idx =
            Math.floor((y / this.H) * this.res) * this.res +
            Math.floor((x / this.W) * this.res);

          if (this.heat.current[idx] > threshold) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.rect(x, y, gridSize, gridSize);
            this.ctx.clip();
            this.ctx.globalAlpha = 1; // full opacity on reveal regions
            this.ctx.drawImage(this.coverCanvas, 0, 0);
            this.ctx.restore();
          }
        }
      }
    }
  }

  private _update() {
    const now = performance.now();

    if (!this.heat.lastTime) {
      this.heat.lastTime = now;
      return;
    }

    const dt = Math.min(30, now - this.heat.lastTime) / 16.67;
    this.heat.lastTime = now;
    const P = this.P.effect;
    let maxValue = 0;
    const tempGrid = new Float32Array(this.res * this.res);

    for (let y = 1; y < this.res - 1; y++) {
      for (let x = 1; x < this.res - 1; x++) {
        const idx = y * this.res + x;
        if (
          this.heat.current[idx] < P.threshold &&
          this.heat.current[idx - this.res] < P.threshold &&
          this.heat.current[idx + this.res] < P.threshold &&
          this.heat.current[idx - 1] < P.threshold &&
          this.heat.current[idx + 1] < P.threshold
        ) {
          continue;
        }

        const up = this.heat.current[idx - this.res];
        const down = this.heat.current[idx + this.res];
        const left = this.heat.current[idx - 1];
        const right = this.heat.current[idx + 1];
        const upLeft = this.heat.current[idx - this.res - 1];
        const upRight = this.heat.current[idx - this.res + 1];
        const downLeft = this.heat.current[idx + this.res - 1];
        const downRight = this.heat.current[idx + this.res + 1];

        const neighbors =
          (up + down + left + right) * 0.15 +
          (upLeft + upRight + downLeft + downRight) * 0.05;

        tempGrid[idx] =
          this.heat.current[idx] * (1 - P.diffusion) + neighbors * P.diffusion;

        tempGrid[idx] *= P.decay;

        if (tempGrid[idx] < P.threshold) {
          tempGrid[idx] = 0;
        } else {
          maxValue = Math.max(maxValue, tempGrid[idx]);
        }
      }
    }

    this.heat.current.set(tempGrid);

    // Decay edges
    for (let i = 0; i < this.res; i++) {
      this.heat.current[i] *= P.decay;
      this.heat.current[(this.res - 1) * this.res + i] *= P.decay;
      this.heat.current[i * this.res] *= P.decay;
      this.heat.current[i * this.res + (this.res - 1)] *= P.decay;
    }

    this.heat.maxValue = maxValue;

    if (maxValue <= P.threshold) {
      this._stop();
    }
  }

  private _start() {
    if (!this.heat.active) {
      this.heat.active = true;
      this._anim();
    }
  }

  private _stop() {
    this.heat.active = false;
    cancelAnimationFrame(this._raf!);
    this._render();
  }

  private _anim = () => {
    this._update();
    this._render();
    if (this.heat.active) {
      this._raf = requestAnimationFrame(this._anim);
    }
  };

  private _raf?: number;

  private _addHeat(px: number, py: number, amount = 1) {
    const nx = (px / this.W) * this.res;
    const ny = (py / this.H) * this.res;
    const rad = this.lowPerformanceMode ? 8 : 12;

    for (let i = -rad; i <= rad; i++) {
      for (let j = -rad; j <= rad; j++) {
        const x = Math.floor(nx + i);
        const y = Math.floor(ny + j);

        if (x < 0 || x >= this.res || y < 0 || y >= this.res) continue;

        const idx = y * this.res + x;
        const d = Math.hypot(i, j);

        if (d <= rad) {
          const intensity = amount * Math.pow(1 - d / rad, 1.5);
          this.heat.current[idx] += intensity;
          this.heat.current[idx] = Math.min(1, this.heat.current[idx]);
          this.heat.maxValue = Math.max(this.heat.maxValue, this.heat.current[idx]);
        }
      }
    }

    this._start();
  }

  private _move = (e: PointerEvent) => {
    const now = performance.now();
    if (this._lastEvt && now - this._lastEvt < 30) return;

    this._lastEvt = now;
    const { x, y } = this._coords(e);

    if (this._lastX != null) {
      const dist = Math.hypot(x - this._lastX, y - this._lastY!);
      if (dist > 2) this._addHeat(x, y, Math.min(dist * 0.03, 0.8));
    }

    this._lastX = x;
    this._lastY = y;
  };

  private _down = (e: PointerEvent) => {
    const { x, y } = this._coords(e);
    this._addHeat(x, y, 1.5);
    this._lastX = x;
    this._lastY = y;
  };

  private _leave = () => {
    this._lastX = null;
    this._lastY = null;
    // Do NOT stop heat here to keep color reveal continuous while hovering
  };

  private _coords(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    const cx = e.clientX - r.left;
    const cy = e.clientY - r.top;
    return { x: cx * (this.W / r.width), y: cy * (this.H / r.height) };
  }

  private _startScrambling() {
    this.scrambleTimer = setInterval(() => {
      if (this.scrambleActive && (!this.heat.active || this.lowPerformanceMode)) {
        this._scrambleRandomChars();
      }
    }, this.scrambleInterval);
  }

  private _scrambleRandomChars() {
    if (this.heat.active && this.heat.maxValue > 0.5) return;

    const numChars = Math.floor(this.charGrid.length * this.scrambleAmount);
    for (let i = 0; i < numChars; i++) {
      const randomIndex = Math.floor(Math.random() * this.charGrid.length);
      const cell = this.charGrid[randomIndex];

      if (!cell.isWordChar) {
        cell.char = this.characters.charAt(
          Math.floor(Math.random() * this.characters.length)
        );
      }
    }

    this._renderStaticGrid();
    if (!this.heat.active) {
      this._render();
    }
  }

  private _monitorPerformance() {
    const checkPerformance = () => {
      this.frameCount++;
      const now = performance.now();
      if (now - this.lastFrameTime >= 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.lastFrameTime = now;

        if (this.fps < 30 && !this.lowPerformanceMode) {
          this.lowPerformanceMode = true;
          this.scrambleInterval = 1000;
          this.scrambleAmount = 0.05;
          clearInterval(this.scrambleTimer);
          this._startScrambling();
        } else if (this.fps > 50 && this.lowPerformanceMode) {
          this.lowPerformanceMode = false;
          this.scrambleInterval = 500;
          this.scrambleAmount = 0.08;
          clearInterval(this.scrambleTimer);
          this._startScrambling();
        }
      }
      requestAnimationFrame(checkPerformance);
    };

    checkPerformance();
  }

  private _bindEvents() {
    this.canvas.addEventListener("pointermove", this._move, { passive: true });
    this.canvas.addEventListener("pointerdown", this._down, { passive: true });
    this.canvas.addEventListener("pointerleave", this._leave, { passive: true });
    this.canvas.addEventListener("pointercancel", this._leave, { passive: true });

    document.addEventListener("visibilitychange", this._visibilityChange);
  }

  private _visibilityChange = () => {
    this.scrambleActive = !document.hidden;
  };

  public destroy() {
    if (this.scrambleTimer) clearInterval(this.scrambleTimer);
    this._stop();
    this.canvas.removeEventListener("pointermove", this._move);
    this.canvas.removeEventListener("pointerdown", this._down);
    this.canvas.removeEventListener("pointerleave", this._leave);
    this.canvas.removeEventListener("pointercancel", this._leave);
    document.removeEventListener("visibilitychange", this._visibilityChange);
  }
}
