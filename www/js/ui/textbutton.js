
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

var UIPACK_CALLBACKS = UIPACK_CALLBACKS || {};

var UIPACK_CONSTANTS = UIPACK_CONSTANTS || {};

UIPACK_CONSTANTS.label_distance = 3.1;
UIPACK_CONSTANTS.label_front_gap = 0.1;

// FROM aframe-bmfont-text-component scaling
UIPACK_CONSTANTS.font_scaling = 0.005;


/**
 ** UI-thumbnail
 */


AFRAME.registerComponent('uipack-textbutton', {
        schema: {
            pitch: { type: 'number', default: 0.0},
            width: { type: 'number', default: 0.5},
            yaw: { type: 'number', default: 0.0},
            text: { type: 'string', default: ""},
            text_scale: { type: 'number', default: 1.0},
            text_color: { type: 'string', default: "#000"},
            text_background: { type: 'string', default: "#FFF"}

        },

        /**
         * Called once when component is attached. Generally for initial setup.
         */

        init: function () {


            var self = this;


            // Create label

            self.text = document.createElement("a-entity");

            self.text.addEventListener("font-loaded", function () {

                var font_factor = UIPACK_CONSTANTS.font_scaling * self.data.text_scale;

                // On font loaded, recalculate widths and heights of rects

                var width = self.text.object3D.children[0].geometry.layout._width;
                var height = self.text.object3D.children[0].geometry.layout._height;

                // If width > self.data.width, arrange new width (higher) for text_rect

                var rect_width = width*font_factor > self.data.width ? width*font_factor * 1.2 : self.data.width;

                self.text.setAttribute("position", -width * (font_factor / 2) + " " + - (height*font_factor*0.5) + " " + UIPACK_CONSTANTS.label_front_gap);

                self.text.setAttribute("visible", "true");

                self.text_rect.setAttribute("width", rect_width);
                self.text_rect.setAttribute("height", (height*font_factor)*2);

                self.text_rect.setAttribute("position", "0 " + " 0 " + " 0");

                self.icon.setAttribute("position", "0 " + - (height*font_factor)*2 + " 0.2");

                self.el.real_width = rect_width;

            });


            // Create text button 'rect'

            self.text_rect = document.createElement("a-plane");


            // Append both

            self.el.appendChild(self.text);
            self.el.appendChild(self.text_rect);


            // Only with data.text, we draw a button to show/hide it

            self.icon = document.createElement("a-entity");

            self.icon.setAttribute("uipack-button", AFRAME.utils.styleParser.stringify({icon_name: "flat/up-arrow-1", "pitch": 0, "yaw": 0}));

            self.el.appendChild(self.icon);


            // On icon clicked

            self.icon.addEventListener("clicked", function (e) {

                self.el.emit('clicked', null, false);

            }, false);


    },

//
//  /**
//   * Called when component is attached and when component data changes.
//   * Generally modifies the entity based on the data.
//   */

  update: function (oldData) {

    var self = this;


    // If parent is scene, absolute positioning, else, leave position up to the user

    if(self.el.parentEl === self.el.sceneEl) {


    // Position element

    self.y_position = UIPACK_CONSTANTS.label_distance * Math.sin(this.data.pitch * Math.PI/180.0);
    self.x_position = UIPACK_CONSTANTS.label_distance * Math.cos(this.data.pitch * Math.PI/180.0) * Math.cos(this.data.yaw * Math.PI/180.0);
    self.z_position = -UIPACK_CONSTANTS.label_distance * Math.cos(this.data.pitch * Math.PI/180.0)* Math.sin(this.data.yaw * Math.PI/180.0);

    // Update position

    this.el.setAttribute("position", [self.x_position, self.y_position, self.z_position].join(" "));

//    this.el.setAttribute("look-at", "0.0 0.0 0.0");

    this.el.object3D.lookAt(new THREE.Vector3( 0, 0, 0));


    }

    // Change background colors

    self.text_rect.setAttribute("color", self.data.text_background);

    // text hidden until font callback positions it

    self.text.setAttribute("visible", "false");

    self.text.setAttribute("bmfont-text", AFRAME.utils.styleParser.stringify({text: self.data.text, color: self.data.text_color, align: "left", mode: "nowrap", width: 0}));
    self.text.setAttribute("scale", [this.data.text_scale, this.data.text_scale, this.data.text_scale].join(" "));



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

