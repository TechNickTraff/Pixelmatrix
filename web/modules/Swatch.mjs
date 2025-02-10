export class Swatch {
  constructor(color_array) {
    this.colors = ["#ffffff", ...color_array];
    this.color = color_array[0];
    this.registerNodes();
  }

  registerNodes() {
    let l = document.getElementsByClassName("swatch-color");
    for (let i = 0; i < l.length; i++) {
      l[i].style.background = this.colors[i];
      l[i].addEventListener("click", (e) => this.handleColorSelect(e, i));
      l[i].addEventListener("contextmenu", (e) => this.handleColorEdit(e, i));
    }
  }

  handleColorSelect(e, id) {
    this.color = this.colors[id];
  }

  handleColorEdit(e, id) {
    e.preventDefault();
    let _color = window.prompt("Enter color hex code (e.g. #fcba03):");

    if (!(/^#[0-9A-Fa-f]{6}$/i.test(_color) || /^#[0-9A-Fa-f]{3}$/i.test(_color))
    ) {
      window.alert("Invalid hex code given.");
    } else {
      this.colors[id] = _color;
      this.color = this.colors[id];
      l[i].style.background = this.colors[id];
    }
  }
}
