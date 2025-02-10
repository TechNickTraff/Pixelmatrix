import app from "./App.mjs";
import { Grid } from "./Grid.mjs";

export class Gallery {
  elements = [];
  constructor() {
    this.registerNodes();
    window.setTimeout(() => {
      this.fetch();
    }, 0);
  }

  registerNodes() {
    this.gallery = document.querySelector("#gallery");
  }

  fetch() {
    fetch(app.settings.api_endpoint + '/list').then(response => {
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      response.json().then(fileListing => {
        for (const file of fileListing.files.flat()) {
          fetch(app.settings.api_endpoint + '/gallery/' + file).then((detailResponse) => {
            if (!detailResponse.ok) {
              throw new Error(`Response status: ${detailResponse.status}`);
            }
            detailResponse.json().then((preset) => {
              const index = file - 1;
              if(this.elements[index] && this.elements[index].el) {
                preset.el = this.elements[index].el;
              }
              this.elements[index] = preset;
              this.updateView();
            });
          });
        }
      });
    });
  }

  updateView() {
    this.gallery.innerHTML = "";
    for(const element of this.elements) {
      if(element) {
        element.el = this.gallery.appendChild(document.createElement('div'));
        element.el.class = "element";
        element.el.innerHTML = '<div class="title"><h5>' + element.name + '</h5><svg class="delete" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-width="1.5" viewBox="0 0 24 24"><path stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" d="M6.758 17.243 12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243"/></svg></div><canvas class="preview" width="110px" height="110px"></canvas>';
        element.el.addEventListener("click", (e) => this.import(element));
        element.el.querySelector('.delete').addEventListener("click", (e) => this.delete(element));
        element.grid = new Grid(app.settings.row_count, app.settings.column_count, 110 / app.settings.column_count);
        element.grid.import(element.data[0]);
        element.grid.draw(element.el.querySelector('canvas').getContext("2d"));
      }
    }
  }

  import(element) {
    app.import(element);
  }

  delete(element) {
    if (confirm('Are you sure?')) {
      fetch(app.settings.api_endpoint + '/delete/' + element.id).then((response) => {
        if (response.ok) {
          element.el.remove();
        } else {
          alert("Delete failed");
        }
      });
    }
  }

  getNextId() {
    return this.elements.reduce((acc, cur) => cur.id > acc ? cur.id : acc, 0) + 1;
  }
}
