const empty_color = "#000000";

export class Cell {
  constructor(x_index, y_index, size) {
    this.padding = 1;
    this.size = size;
    this.x = x_index * this.size;
    this.y = y_index * this.size;
    this.color = empty_color;
    this.isHovered = false;
  }

  empty() {
    return this.color == empty_color;
  }

  onHover() {
    this.isHovered = true;
  }
  onUnhover() {
    this.isHovered = false;
  }
  onClick(color) {
    this.color = color;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x + this.padding,
      this.y + this.padding,
      this.size - this.padding * 2,
      this.size - this.padding * 2,
    );

    if (this.isHovered) {
      ctx.strokeStyle = "#3197EE";
      ctx.strokeRect(this.x, this.y, this.size, this.size);
    }
  }
}
