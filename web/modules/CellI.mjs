export class CellIndex {
  cell_index;

  constructor() {
    this.cell_index = document.querySelector("#cell-index");
  }

  update(x, y) {
    this.cell_index.innerHTML = x + ", " + y;
  }
}
