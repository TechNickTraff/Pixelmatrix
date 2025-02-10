import app from "./App.mjs";

export class MouseTracker {

  x = undefined;
  y = undefined;
  isClicked= false;

  constructor(canvas) {
    this.canvas = canvas;

    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mousedown", () => this.isClicked = true);
    this.canvas.addEventListener("mouseup",  () => this.isClicked = false);
  }

  handleMouseMove(e) {
    this.x = e.clientX - this.canvas.offsetLeft - 20;
    this.y = e.clientY - this.canvas.offsetTop - 20;
  }
}
