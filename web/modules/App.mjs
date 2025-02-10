import { Grid } from "./Grid.mjs";
import { Swatch } from "./Swatch.mjs";
import { MouseTracker } from "./MTra.mjs";
import { Gallery } from "./Gallery.mjs";

class App {
  instance = undefined;

  settings = {
    row_count: 16,
    column_count: 16,
    cell_size: window.innerWidth > 512 ? 32 : (window.innerWidth - 80) / columns,
    colors: ["#35D461", "#F9E104", "#F99D07", "#882FF6", "#37B6F6"],
    api_endpoint: "",
  }

  constructor() {
    this.registerNodes();
    this.mouse = new MouseTracker(this.canvas);
    this.gallery = new Gallery();
  }

  static getInstance(settings) {
    if (!this.instance) {
      this.instance = new App(settings);
    }

    return this.instance;
  }

  registerNodes() {
    this.app = document.querySelector("#app");
    this.canvas = document.querySelector("#canvas");
    this.image_loader = document.querySelector("#image-load");
    this.save_button = document.querySelector("#save");
    this.clear_button = document.querySelector("#clear");
    this.name_field = document.querySelector("#name");
    this.timing_field = document.querySelector("#timing");
    this.frame_selectors = document.querySelectorAll(".frame-selector");

    this.registerEventHandlers();

    this.ctx = canvas.getContext("2d");
  }

  registerEventHandlers() {
    this.image_loader.addEventListener("change", e => this.grid.importFromImage(e, this.ctx, this.canvas), false);
    this.save_button.addEventListener("click", this.save.bind(this));
    this.clear_button.addEventListener("click", this.clear.bind(this));
    this.frame_selectors.forEach(el => el.addEventListener("click", () => this.setActiveFrame(el.dataset.frame)));
  }

  configure(settings) {
    this.settings = {...this.settings, ...settings }

    this.frames = Array(5);
    for(let i=0; i < this.frames.length; i++) {
        this.frames[i] = new Grid(this.settings.row_count, this.settings.column_count, this.settings.cell_size);
    }
    this.grid = this.frames[0];
    this.swatch = new Swatch(this.settings.colors);

    this.canvas.width = this.settings.cell_size * this.settings.column_count;
    this.app.style.width = this.settings.cell_size * this.settings.column_count + 40 + "px";
    this.canvas.height = this.settings.cell_size * this.settings.row_count;
  }

  save() {
    const dump = this.export();

    if(dump.name.trim().length <= 0) {
      alert("You have to give your sketch a name");
      return;
    }

    if(dump.timing < 0 || dump.timing > 20000) {
      alert("Please choose a timing between 0 and 20000");
    }

    if(dump.data.length === 0) {
      alert("At least one Frame has to contain data");
      return;
    }

    const body = JSON.stringify(dump);
    if(body.length > 4000) {
      alert("File too big for arduino webserver, please upload it directly");
      const blob = new Blob([body], { type: 'text/plain' });
      const fileURL = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = fileURL;
      downloadLink.download = dump.id;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      URL.revokeObjectURL(fileURL);
      downloadLink.delete();
    }

    fetch(this.settings.api_endpoint + '/save', {
      method: 'POST',
      body: JSON.stringify(dump)
    }).then((response) => {
      if(!response.ok) {
        alert("Error during save");
      }
      window.setTimeout(() => {
        this.gallery.fetch();
      }, 5);
    });
  }

  export () {
    const filled_frames = this.frames.filter(frame => !frame.empty()).map((frame) => frame.export());

    return {
      id: this.id || this.gallery.getNextId(),
      name: this.name_field.value,
      timing: this.timing_field.value,
      frame_amount: filled_frames.length,
      data: filled_frames
    };
  }

  clear() {
    this.id = undefined;
    this.name_field.value = "";
    this.timing_field.value = 100;
    this.frames = Array(5);
    for(let i=0; i < this.frames.length; i++) {
        this.frames[i] = new Grid(this.settings.row_count, this.settings.column_count, this.settings.cell_size);
    }
    this.grid = this.frames[0];
  }

  setActiveFrame(id) {
    this.grid = this.frames[id - 1];
    this.frame_selectors.forEach(el => el.checked = el.dataset.frame == id);
  }

  run() {
    requestAnimationFrame(this.run.bind(this));
    this.ctx.clearRect(0, 0, this.settings.row_count * this.settings.cell_size, this.settings.column_count * this.settings.cell_size);
    this.grid.update(this.mouse, this.ctx);
  }

  import(save) {
    this.clear();
    this.id = save.id;
    this.name_field.value = save.name;
    this.timing_field.value = save.timing;
    for (let i = 0; i < save.frame_amount; i++) {
      this.frames[i].import(save.data[i]);
    }
    this.setActiveFrame(1);
  }
}


const app = App.getInstance();

export default app;
