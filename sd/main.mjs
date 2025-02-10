(function () {
  'use strict';

  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _arrayWithoutHoles(r) {
    if (Array.isArray(r)) return _arrayLikeToArray(r);
  }
  function _classCallCheck(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
    }
  }
  function _createClass(e, r, t) {
    return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
      writable: false
    }), e;
  }
  function _createForOfIteratorHelper(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (!t) {
      if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) {
        t && (r = t);
        var n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return n >= r.length ? {
              done: true
            } : {
              done: false,
              value: r[n++]
            };
          },
          e: function (r) {
            throw r;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var o,
      a = true,
      u = false;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r = t.next();
        return a = r.done, r;
      },
      e: function (r) {
        u = true, o = r;
      },
      f: function () {
        try {
          a || null == t.return || t.return();
        } finally {
          if (u) throw o;
        }
      }
    };
  }
  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r] = t, e;
  }
  function _iterableToArray(r) {
    if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function (r) {
        _defineProperty(e, r, t[r]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
        Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
      });
    }
    return e;
  }
  function _toConsumableArray(r) {
    return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (undefined !== e) {
      var i = e.call(t, r);
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (String )(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : undefined;
    }
  }

  var empty_color="#000000";var Cell=/*#__PURE__*/function(){function Cell(x_index,y_index,size){_classCallCheck(this,Cell);this.padding=1;this.size=size;this.x=x_index*this.size;this.y=y_index*this.size;this.color=empty_color;this.isHovered=false;}return _createClass(Cell,[{key:"empty",value:function empty(){return this.color==empty_color}},{key:"onHover",value:function onHover(){this.isHovered=true;}},{key:"onUnhover",value:function onUnhover(){this.isHovered=false;}},{key:"onClick",value:function onClick(color){this.color=color;}},{key:"draw",value:function draw(ctx){ctx.fillStyle=this.color;ctx.fillRect(this.x+this.padding,this.y+this.padding,this.size-this.padding*2,this.size-this.padding*2);if(this.isHovered){ctx.strokeStyle="#3197EE";ctx.strokeRect(this.x,this.y,this.size,this.size);}}}])}();

  var CellIndex=/*#__PURE__*/function(){function CellIndex(){_classCallCheck(this,CellIndex);_defineProperty(this,"cell_index",undefined);this.cell_index=document.querySelector("#cell-index");}return _createClass(CellIndex,[{key:"update",value:function update(x,y){this.cell_index.innerHTML=x+", "+y;}}])}();

  var Grid=/*#__PURE__*/function(){function Grid(row_count,column_count,cell_size){_classCallCheck(this,Grid);this.cell_index=new CellIndex;this.row_count=row_count;this.column_count=column_count;this.cell_size=cell_size;this.cells=[];for(var y=0;y<this.column_count;y++){var columns=[];for(var x=0;x<this.row_count;x++){columns.push(new Cell(x,y,cell_size));}this.cells.push(columns);}}return _createClass(Grid,[{key:"update",value:function update(mouse,ctx){for(var y=0;y<this.column_count;y++){for(var x=0;x<this.row_count;x++){var c=this.cells[y][x];if(c.x<=mouse.x+window.scrollX&&mouse.x+window.scrollX<c.x+c.size&&c.y<=mouse.y+window.scrollY&&mouse.y+window.scrollY<c.y+c.size){c.onHover();this.cell_index.update(x,y);if(mouse.isClicked){c.onClick(app.swatch.color);}}else {c.onUnhover();}c.draw(ctx);}}}},{key:"draw",value:function draw(ctx){for(var y=0;y<this.column_count;y++){for(var x=0;x<this.row_count;x++){var c=this.cells[y][x];c.draw(ctx);}}}},{key:"empty",value:function empty(){return this.cells.flat().every(function(cell){return cell.empty()})}},{key:"export",value:function _export(){return this.cells.flat().map(function(e){return e.color})}},{key:"import",value:function _import(data){for(var y=0;y<this.column_count;y++){for(var x=0;x<this.row_count;x++){this.cells[y][x].color=data[y*this.row_count+x];}}}},{key:"importFromImage",value:function importFromImage(e,ctx,canvas){var _this=this;var componentToHex=function componentToHex(c){var hex=c.toString(16);return hex.length==1?"0"+hex:hex};var reader=new FileReader;reader.onload=function(event){var img=new Image;img.onload=function(){var hRatio=canvas.width/img.width;var vRatio=canvas.height/img.height;var ratio=Math.min(hRatio,vRatio);var centerShift_x=(canvas.width-img.width*ratio)/2;var centerShift_y=(canvas.height-img.height*ratio)/2;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,img.width,img.height,centerShift_x,centerShift_y,img.width*ratio,img.height*ratio);for(var y=0;y<_this.column_count;y++){for(var x=0;x<_this.row_count;x++){var data=ctx.getImageData(x*_this.cell_size,y*_this.cell_size,_this.cell_size,_this.cell_size).data;var components=data.length;var pixelsPerChannel=components/4;var R=0;var G=0;var B=0;for(var i=0;i<components;i+=4){R=R+data[i];G=G+data[i+1];B=B+data[i+2];}R=R/pixelsPerChannel|0;G=G/pixelsPerChannel|0;B=B/pixelsPerChannel|0;_this.cells[y][x].color="#".concat(componentToHex(R)).concat(componentToHex(G)).concat(componentToHex(B));}}};img.src=event.target.result;};reader.readAsDataURL(e.target.files[0]);}}])}();

  var Swatch=/*#__PURE__*/function(){function Swatch(color_array){_classCallCheck(this,Swatch);this.colors=["#ffffff"].concat(_toConsumableArray(color_array));this.color=color_array[0];this.registerNodes();}return _createClass(Swatch,[{key:"registerNodes",value:function registerNodes(){var _this=this;var l=document.getElementsByClassName("swatch-color");var _loop=function _loop(_i){l[_i].style.background=_this.colors[_i];l[_i].addEventListener("click",function(e){return _this.handleColorSelect(e,_i)});l[_i].addEventListener("contextmenu",function(e){return _this.handleColorEdit(e,_i)});};for(var _i=0;_i<l.length;_i++){_loop(_i);}}},{key:"handleColorSelect",value:function handleColorSelect(e,id){this.color=this.colors[id];}},{key:"handleColorEdit",value:function handleColorEdit(e,id){e.preventDefault();var _color=window.prompt("Enter color hex code (e.g. #fcba03):");if(!(/^#[0-9A-Fa-f]{6}$/i.test(_color)||/^#[0-9A-Fa-f]{3}$/i.test(_color))){window.alert("Invalid hex code given.");}else {this.colors[id]=_color;this.color=this.colors[id];l[i].style.background=this.colors[id];}}}])}();

  var MouseTracker=/*#__PURE__*/function(){function MouseTracker(canvas){var _this=this;_classCallCheck(this,MouseTracker);_defineProperty(this,"x",undefined);_defineProperty(this,"y",undefined);_defineProperty(this,"isClicked",false);this.canvas=canvas;this.canvas.addEventListener("mousemove",this.handleMouseMove.bind(this));this.canvas.addEventListener("mousedown",function(){return _this.isClicked=true});this.canvas.addEventListener("mouseup",function(){return _this.isClicked=false});}return _createClass(MouseTracker,[{key:"handleMouseMove",value:function handleMouseMove(e){this.x=e.clientX-this.canvas.offsetLeft-20;this.y=e.clientY-this.canvas.offsetTop-20;}}])}();

  var Gallery=/*#__PURE__*/function(){function Gallery(){var _this=this;_classCallCheck(this,Gallery);_defineProperty(this,"elements",[]);this.registerNodes();window.setTimeout(function(){_this.fetch();},0);}return _createClass(Gallery,[{key:"registerNodes",value:function registerNodes(){this.gallery=document.querySelector("#gallery");}},{key:"fetch",value:function(_fetch){function fetch(){return _fetch.apply(this,arguments)}fetch.toString=function(){return _fetch.toString()};return fetch}(function(){var _this2=this;fetch(app.settings.api_endpoint+"/list").then(function(response){if(!response.ok){throw new Error("Response status: ".concat(response.status))}response.json().then(function(fileListing){var _iterator=_createForOfIteratorHelper(fileListing.files.flat()),_step;try{var _loop=function _loop(){var file=_step.value;fetch(app.settings.api_endpoint+"/gallery/"+file).then(function(detailResponse){if(!detailResponse.ok){throw new Error("Response status: ".concat(detailResponse.status))}detailResponse.json().then(function(preset){var index=file-1;if(_this2.elements[index]&&_this2.elements[index].el){preset.el=_this2.elements[index].el;}_this2.elements[index]=preset;_this2.updateView();});});};for(_iterator.s();!(_step=_iterator.n()).done;){_loop();}}catch(err){_iterator.e(err);}finally{_iterator.f();}});});})},{key:"updateView",value:function updateView(){var _this3=this;this.gallery.innerHTML="";var _iterator2=_createForOfIteratorHelper(this.elements),_step2;try{var _loop2=function _loop2(){var element=_step2.value;if(element){element.el=_this3.gallery.appendChild(document.createElement("div"));element.el["class"]="element";element.el.innerHTML="<div class=\"title\"><h5>"+element.name+"</h5><svg class=\"delete\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" stroke-width=\"1.5\" viewBox=\"0 0 24 24\"><path stroke=\"currentcolor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M6.758 17.243 12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243\"/></svg></div><canvas class=\"preview\" width=\"110px\" height=\"110px\"></canvas>";element.el.addEventListener("click",function(e){return _this3["import"](element)});element.el.querySelector(".delete").addEventListener("click",function(e){return _this3["delete"](element)});element.grid=new Grid(app.settings.row_count,app.settings.column_count,110/app.settings.column_count);element.grid["import"](element.data[0]);element.grid.draw(element.el.querySelector("canvas").getContext("2d"));}};for(_iterator2.s();!(_step2=_iterator2.n()).done;){_loop2();}}catch(err){_iterator2.e(err);}finally{_iterator2.f();}}},{key:"import",value:function _import(element){app["import"](element);}},{key:"delete",value:function _delete(element){if(confirm("Are you sure?")){fetch(app.settings.api_endpoint+"/delete/"+element.id).then(function(response){if(response.ok){element.el.remove();}else {alert("Delete failed");}});}}},{key:"getNextId",value:function getNextId(){return this.elements.reduce(function(acc,cur){return cur.id>acc?cur.id:acc},0)+1}}])}();

  var App=/*#__PURE__*/function(){function App(){_classCallCheck(this,App);_defineProperty(this,"instance",undefined);_defineProperty(this,"settings",{row_count:16,column_count:16,cell_size:window.innerWidth>512?32:(window.innerWidth-80)/columns,colors:["#35D461","#F9E104","#F99D07","#882FF6","#37B6F6"],api_endpoint:""});this.registerNodes();this.mouse=new MouseTracker(this.canvas);this.gallery=new Gallery;}return _createClass(App,[{key:"registerNodes",value:function registerNodes(){this.app=document.querySelector("#app");this.canvas=document.querySelector("#canvas");this.image_loader=document.querySelector("#image-load");this.save_button=document.querySelector("#save");this.clear_button=document.querySelector("#clear");this.name_field=document.querySelector("#name");this.timing_field=document.querySelector("#timing");this.frame_selectors=document.querySelectorAll(".frame-selector");this.registerEventHandlers();this.ctx=canvas.getContext("2d");}},{key:"registerEventHandlers",value:function registerEventHandlers(){var _this=this;this.image_loader.addEventListener("change",function(e){return _this.grid.importFromImage(e,_this.ctx,_this.canvas)},false);this.save_button.addEventListener("click",this.save.bind(this));this.clear_button.addEventListener("click",this.clear.bind(this));this.frame_selectors.forEach(function(el){return el.addEventListener("click",function(){return _this.setActiveFrame(el.dataset.frame)})});}},{key:"configure",value:function configure(settings){this.settings=_objectSpread2(_objectSpread2({},this.settings),settings);this.frames=Array(5);for(var i=0;i<this.frames.length;i++){this.frames[i]=new Grid(this.settings.row_count,this.settings.column_count,this.settings.cell_size);}this.grid=this.frames[0];this.swatch=new Swatch(this.settings.colors);this.canvas.width=this.settings.cell_size*this.settings.column_count;this.app.style.width=this.settings.cell_size*this.settings.column_count+40+"px";this.canvas.height=this.settings.cell_size*this.settings.row_count;}},{key:"save",value:function save(){var _this2=this;var dump=this["export"]();if(dump.name.trim().length<=0){alert("You have to give your sketch a name");return}if(dump.timing<0||dump.timing>20000){alert("Please choose a timing between 0 and 20000");}if(dump.data.length===0){alert("At least one Frame has to contain data");return}var body=JSON.stringify(dump);if(body.length>4000){alert("File too big for arduino webserver, please upload it directly");var blob=new Blob([body],{type:"text/plain"});var fileURL=URL.createObjectURL(blob);var downloadLink=document.createElement("a");downloadLink.href=fileURL;downloadLink.download=dump.id;document.body.appendChild(downloadLink);downloadLink.click();URL.revokeObjectURL(fileURL);downloadLink["delete"]();}fetch(this.settings.api_endpoint+"/save",{method:"POST",body:JSON.stringify(dump)}).then(function(response){if(!response.ok){alert("Error during save");}window.setTimeout(function(){_this2.gallery.fetch();},5);});}},{key:"export",value:function _export(){var filled_frames=this.frames.filter(function(frame){return !frame.empty()}).map(function(frame){return frame["export"]()});return {id:this.id||this.gallery.getNextId(),name:this.name_field.value,timing:this.timing_field.value,frame_amount:filled_frames.length,data:filled_frames}}},{key:"clear",value:function clear(){this.id=undefined;this.name_field.value="";this.timing_field.value=100;this.frames=Array(5);for(var i=0;i<this.frames.length;i++){this.frames[i]=new Grid(this.settings.row_count,this.settings.column_count,this.settings.cell_size);}this.grid=this.frames[0];}},{key:"setActiveFrame",value:function setActiveFrame(id){this.grid=this.frames[id-1];this.frame_selectors.forEach(function(el){return el.checked=el.dataset.frame==id});}},{key:"run",value:function run(){requestAnimationFrame(this.run.bind(this));this.ctx.clearRect(0,0,this.settings.row_count*this.settings.cell_size,this.settings.column_count*this.settings.cell_size);this.grid.update(this.mouse,this.ctx);}},{key:"import",value:function _import(save){this.clear();this.id=save.id;this.name_field.value=save.name;this.timing_field.value=save.timing;for(var i=0;i<save.frame_amount;i++){this.frames[i]["import"](save.data[i]);}this.setActiveFrame(1);}}],[{key:"getInstance",value:function getInstance(settings){if(!this.instance){this.instance=new App();}return this.instance}}])}();var app=App.getInstance();

  var settings={};app.configure(settings);app.run();

})();
