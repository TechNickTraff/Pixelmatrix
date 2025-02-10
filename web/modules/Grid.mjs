import { Cell } from "./Cell.mjs";
import { CellIndex } from "./CellI.mjs";
import app from "./App.mjs";

export class Grid {
  constructor(row_count, column_count, cell_size) {
    this.cell_index = new CellIndex();
    this.row_count = row_count;
    this.column_count = column_count;
    this.cell_size = cell_size;

    this.cells = [];

    for (var y = 0; y < this.column_count; y++) {
      var columns = [];
      for (var x = 0; x < this.row_count; x++) {
        columns.push(new Cell(x, y, cell_size));
      }
      this.cells.push(columns);
    }
  }

  update(mouse, ctx) {
    for (var y = 0; y < this.column_count; y++) {
      for (var x = 0; x < this.row_count; x++) {
        var c = this.cells[y][x];

        if (
          c.x <= mouse.x + window.scrollX &&
          mouse.x + window.scrollX < c.x + c.size &&
          c.y <= mouse.y + window.scrollY &&
          mouse.y + window.scrollY < c.y + c.size
        ) {
          c.onHover();
          this.cell_index.update(x, y);

          if (mouse.isClicked) {
            c.onClick(app.swatch.color);
          }
        } else {
          c.onUnhover();
        }

        c.draw(ctx);
      }
    }
  }

  draw(ctx) {
    for (var y = 0; y < this.column_count; y++) {
      for (var x = 0; x < this.row_count; x++) {
        var c = this.cells[y][x];
        c.draw(ctx);
      }
    }
  }

  empty() {
    return this.cells.flat().every(cell => cell.empty());
  }

  export() {
    return this.cells.flat().map((e) => e.color);
  }

  import(data) {
    for (var y = 0; y < this.column_count; y++) {
      for (var x = 0; x < this.row_count; x++) {
        this.cells[y][x].color = data[y * this.row_count + x];
      }
    }
  }

  importFromImage(e, ctx, canvas) {
    const componentToHex = (c) => {
      const hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    };

    let reader = new FileReader();
    reader.onload = (event) => {
      let img = new Image();
      img.onload = () => {
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.min(hRatio, vRatio);
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);

        for (var y = 0; y < this.column_count; y++) {
          for (var x = 0; x < this.row_count; x++) {
            const data = ctx.getImageData(x * this.cell_size, y * this.cell_size, this.cell_size, this.cell_size).data;
            const components = data.length;
            const pixelsPerChannel = components / 4;
            let R = 0;
            let G = 0;
            let B = 0;

            for (let i = 0; i < components; i += 4) {
              R = R + data[i];
              G = G + data[i + 1];
              B = B + data[i + 2];
            }

            R = (R / pixelsPerChannel) | 0;
            G = (G / pixelsPerChannel) | 0;
            B = (B / pixelsPerChannel) | 0;

            this.cells[y][x].color = `#${componentToHex(R)}${componentToHex(G)}${componentToHex(B)}`;
          }
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
  }
}
