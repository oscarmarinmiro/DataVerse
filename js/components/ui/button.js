/**
 * Created by Oscar on 14/08/16.
 */


AFRAME.registerComponent('uipack-button', {
    schema: {
        icon_name: {type: 'string'},
        yaw: { type: 'number', default: 0.0},
        elevation: { type: 'number', default: DATAVERSE.UIPACK_CONSTANTS.button_elevation},
        distance: { type: 'number', default: DATAVERSE.UIPACK_CONSTANTS.button_distance},
        absolute_pos: { type: 'boolean', default: false},
        radius: {type: 'number', default: DATAVERSE.UIPACK_CONSTANTS.button_radius},
        arc_color: {type: 'string', default: "red"},
        theme: {type: 'string', default: ""}
    },

  init: function () {

    var self = this;


    self.button_mode = (DATAVERSE && ('cursor_mode' in DATAVERSE)) ? DATAVERSE.cursor_mode : "desktop";

    // Create the element

    self.button = document.createElement("a-circle");

    this.el.appendChild(self.button);

    // Class the element

    this.el.classList.add("uipack", "uipack-button", "clickable");


    if(self.button_mode === "desktop") {

        this.el.addEventListener("mousedown", function (event) {

            var sound = new Howl({src: DATAVERSE.paths.click_sound, volume: 0.25});

            sound.play();

            self.el.emit("clicked", null, false);

        });

        this.el.addEventListener("mouseenter", function(event){

            self.el.sceneEl.canvas.classList.remove("a-grab-cursor");

        });

        this.el.addEventListener("mouseleave", function(event){

            self.el.sceneEl.canvas.classList.add("a-grab-cursor");

        });

    }

    else {

        // Hover flag and events...

        self.first_hover = true;

        this.el.addEventListener('raycaster-intersected', function (event) {


            // First 'fresh' hover

            if (self.first_hover) {

                // Insert ring for animation on hover

                self.ring = document.createElement("a-ring");
                self.ring.setAttribute("radius-inner", self.data.radius * 1.0);
                self.ring.setAttribute("radius-outer", self.data.radius * 1.2);
                self.ring.setAttribute("material", "color:" + (self.data.theme ? DATAVERSE.themes[self.data.theme].arc_color : self.data.arc_color));
                self.ring.setAttribute("visible", true);

                // Create animation

                self.animation = document.createElement("a-animation");
                self.animation.setAttribute("easing", "linear");
                self.animation.setAttribute("attribute", "geometry.thetaLength");
                self.animation.setAttribute("dur", DATAVERSE.animation.button);
                self.animation.setAttribute("from", "0");
                self.animation.setAttribute("to", "360");

                self.ring.appendChild(self.animation);

                self.el.appendChild(self.ring);

                self.first_hover = false;

                // Emit 'clicked' on ring animation end

                self.animation.addEventListener("animationend", function () {

                    setTimeout(function () {
                        self.first_hover = true;
                    }, 500);

                    var sound = new Howl({src: DATAVERSE.paths.click_sound, volume: 0.25});

                    sound.play();

                    self.el.emit("clicked", null, false);

                    self.ring.parentNode.removeChild(self.ring);


                });
            }
        });

        this.el.addEventListener('raycaster-intersected-cleared', function (event) {

            self.first_hover = true;

            // Change cursor color and scale

            event.detail.el.setAttribute("scale", "1 1 1");

            // Remove ring if existing

            if (self.ring.parentNode) {

                self.ring.parentNode.removeChild(self.ring);
            }

        });
    }

  },
  update: function (oldData) {

    var self = this;

    // CHange material, radius, position and rotation

    self.icon_path = (self.data.theme !== "" ? DATAVERSE.themes[self.data.theme].icon_path : DATAVERSE.UIPACK_CONSTANTS.icon_path) + "/" + self.data.icon_name;

    self.button.setAttribute("material",{"src": 'url(' + self.icon_path + ')', "shader": "flat"});

    self.button.setAttribute("radius", self.data.radius);

        // If parent is scene, absolute positioning, else, leave position up to the user

        if(self.el.parentEl === self.el.sceneEl || self.data.absolute_pos) {

            self.x_position = self.data.distance * Math.cos(this.data.yaw * Math.PI/180.0);
            self.y_position = self.data.elevation;
            self.z_position = -self.data.distance * Math.sin(this.data.yaw * Math.PI/180.0);

            this.el.setAttribute("rotation", {x: 0, y: this.data.yaw - 90, z: 0});

            this.el.setAttribute("position", [self.x_position, self.y_position, self.z_position].join(" "));

        }

        // What was this for??

//      else {
//            console.log("NON ABSOLUTE POSITIONING");
//        }

  }
});
