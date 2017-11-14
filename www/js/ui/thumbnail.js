

AFRAME.registerComponent('uipack-thumbnail', {
    schema: {
        destination: {type: 'string', default: ""},
        shape: {type: 'string', default: "square"},
        yaw: { type: 'number', default: 0.0},
        elevation: { type: 'number', default: UIPACK_CONSTANTS.thumbnail_elevation},
        distance: { type: 'number', default: UIPACK_CONSTANTS.thumbnail_distance},
        text: { type: 'string', default: ""},
        src: { type: 'string', default: ""},
        width: {type: 'number', default: 1.0},
        height: {type: 'number', default: 0.5},
        radius: {type: 'number', default: 1},
        opacity: {type: 'number', default: 1},
        callback: {type: 'string'}
    },

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {

    var self = this;

    // Circle or plane?


    if (this.data.shape === "square") {
        self.thumbnail = document.createElement("a-plane");
        self.thumbnail_border = document.createElement("a-plane");

    }
    else{
        self.thumbnail = document.createElement("a-circle");
        self.thumbnail_border = document.createElement("a-circle");
    }

    self.thumbnail.setAttribute("opacity", self.data.opacity);
    self.thumbnail_border.setAttribute("opacity", self.data.opacity);


    self.icon = document.createElement("a-entity");

    self.icon.setAttribute("uipack-button", {icon_name: UIPACK_CONSTANTS.thumbnail_icon});

    self.icon.setAttribute("visible", "false");

    this.el.appendChild(self.thumbnail);
    this.el.appendChild(self.thumbnail_border);
    this.el.appendChild(self.icon);

    if(self.data.text != "") {

        self.text = document.createElement("a-text");

        self.text.setAttribute("value", self.data.text);

        self.text.setAttribute('align', "center");

        this.el.appendChild(self.text);

    }


    // Event: On icon click, emit click on thumbnail

    self.icon.addEventListener("clicked", function(e) {
                 self.el.emit("clicked", {'destination': self.data.destination}, false);
    }, false);


    // Hover flag and events...

    self.first_hover = true;

    this.el.addEventListener('raycaster-intersected', function(event){

        // First 'fresh' hover

        if(self.first_hover) {

            self.first_hover = false;

            // Change cursor color and scale

            event.detail.el.setAttribute("scale", "2 2 2");

            self.icon.setAttribute("visible", "true");
        }
    });

    this.el.addEventListener('raycaster-intersected-cleared', function(event){

         self.first_hover = true;

         // Change cursor color and scale

         event.detail.el.setAttribute("scale", "1 1 1");
         event.detail.el.setAttribute("visible", "true");

        // Remove ring if existing

         self.icon.setAttribute("visible", "false");

    });

  },
  update: function (oldData) {

    var self = this;

    if (this.data.shape === "square") {
        self.thumbnail.setAttribute("width", this.data.width);
        self.thumbnail.setAttribute("height",this.data.height);
        self.thumbnail.setAttribute("src", this.data.src);

        self.x_position = self.data.distance * Math.cos(this.data.yaw * Math.PI/180.0);
        self.y_position = self.data.elevation;
        self.z_position = -self.data.distance * Math.sin(this.data.yaw * Math.PI/180.0);


        this.el.setAttribute("position", [self.x_position, self.y_position, self.z_position].join(" "));

        this.el.setAttribute("rotation", {x: 0, y: this.data.yaw - 90, z: 0});


        self.thumbnail_border.setAttribute("width", this.data.width*1.1);
        self.thumbnail_border.setAttribute("height", this.data.height*1.1);
        self.thumbnail_border.setAttribute("color", "white");

        self.thumbnail_border.setAttribute("position", "0 0 -0.05");

        self.icon.setAttribute("uipack-button",{icon_name: UIPACK_CONSTANTS.thumbnail_icon, "elevation": 0, "yaw": 0});

        self.icon.setAttribute("position", "0 " + "0" + " 0.2");

        if(self.text) self.text.setAttribute("position", {x: 0, y: this.data.height, z:0});

    }
    else {

        self.thumbnail.setAttribute("radius", this.data.radius);
        self.thumbnail.setAttribute("src", this.data.src);

        self.x_position = self.data.distance * Math.cos(this.data.yaw * Math.PI/180.0);
        self.y_position = self.data.elevation;
        self.z_position = -self.data.distance * Math.sin(this.data.yaw * Math.PI/180.0);

        this.el.setAttribute("position", [self.x_position, self.y_position, self.z_position].join(" "));

        this.el.setAttribute("rotation", {x: 0, y: this.data.yaw - 90, z: 0});

        self.thumbnail_border.setAttribute("radius", this.data.radius*1.1);
        self.thumbnail_border.setAttribute("color", "white");

        self.thumbnail_border.setAttribute("position", "0 0 -0.05");

        self.icon.setAttribute("uipack-button", {icon_name: UIPACK_CONSTANTS.thumbnail_icon, "elevation": 0, "yaw": 0});

        self.icon.setAttribute("position", "0 " + "0" + " 0.2");

        if(self.text) self.text.setAttribute("position", {x: 0, y: this.data.radius*2.0, z:0});

    }
  },
//
//  /**
//   * Called when a component is removed (e.g., via removeAttribute).
//   * Generally undoes all modifications to the entity.
//   */
//  remove: function () { },
//
//  /**
//   * Called on each scene tick.
//   */
  tick: function (t) {

//    // Rotate towards camera
//
//    if(this.el.sceneEl.camera) {
//        this.el.object3D.lookAt(new THREE.Vector3(0,0,0));
//    }

  },

  /**
   * Called when entity pauses.
   * Use to stop or remove any dynamic or background behavior such as events.
   */
  pause: function () { },

  /**
   * Called when entity resumes.
   * Use to continue or add any dynamic or background behavior such as events.
   */
  play: function () { }
});

