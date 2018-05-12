
AFRAME.registerComponent('uipack-infolabel', {
    schema: {
        yaw: { type: 'number', default: 0.0},
        elevation: { type: 'number', default: UIPACK_CONSTANTS.label_elevation},
        distance: {type: 'number', default: UIPACK_CONSTANTS.label_distance},
        width: {type: 'number', default: UIPACK_CONSTANTS.label_width},
        title: { type: 'string', default:""},
        title_scale: { type: 'number', default: 1.0},
        title_color: { type: 'string', default: "#FFF"},
        title_background: { type: 'string', default: "#000"},
        text: { type: 'string', default:""},
        text_scale: { type: 'number', default: 0.5},
        text_color: { type: 'string', default: "#FFF"},
        text_background: { type: 'string', default: "#000"}

    },

  init: function () {


    var self = this;

    self.title = document.createElement("a-entity");
    self.title.setAttribute("text", {
                   'align': 'center',
                   'color': self.data.title_color,
                   'width': self.data.width,
                   'value': self.data.title
                });




    // Create label

    self.title = document.createElement("a-entity");

    self.title.setAttribute("bmfont-text", AFRAME.utils.styleParser.stringify({text: self.data.title, color: self.data.title_color, align: "left", mode: "nowrap", width:0}));
    self.title.setAttribute("position", "0 0 " + UIPACK_CONSTANTS.label_front_gap);
    self.title.setAttribute("scale", [this.data.title_scale, this.data.title_scale, this.data.title_scale].join(" "));


    self.title.addEventListener("font-loaded", function(){

        var font_factor = UIPACK_CONSTANTS.font_scaling * self.data.title_scale;

        // On font loaded, recalculate widths and heights of rects

        var width = self.title.object3D.children[0].geometry.layout._width;
        var height = self.title.object3D.children[0].geometry.layout._height;

        self.title.setAttribute("position", -width*(font_factor/2) + " " +  (height*font_factor * 0.8) + " " + UIPACK_CONSTANTS.label_front_gap);

        // If width > self.data.width, arrange new width (higher) for text_rect

        var rect_width = width*font_factor > self.data.width ? width*font_factor * 1.2 : self.data.width;

        self.title_rect.setAttribute("width", rect_width);
        self.title_rect.setAttribute("height", height*font_factor*1.2);

        self.title_rect.setAttribute("position", "0 " + (height*font_factor*1.2)+ " 0");

        if (self.data.text != "") {
            self.icon.setAttribute("position", "0 " + "0" + " 0.2");
        }

        // Once dimensions are clear, make title rect visible

        self.title_rect.setAttribute("visible", true);

    });


    // Create label_rect

    self.title_rect = document.createElement("a-plane");


    // Until dimensions are not clear, make title rect not visible

    self.title_rect.setAttribute("visible", false);


    // Append both

    self.el.appendChild(self.title);
    self.el.appendChild(self.title_rect);


    // If text exists, draw it + background rect

    if (self.data.text != ""){

        // Create both, hide and append

        self.text = document.createElement("a-entity");
        self.text_rect = document.createElement("a-plane");

        self.text.setAttribute("bmfont-text", AFRAME.utils.styleParser.stringify({text: self.data.text, color: self.data.text_color, align: "left", width: self.data.width/(UIPACK_CONSTANTS.font_scaling*self.data.text_scale)*0.9}));
        self.text.setAttribute("position", "0 0 " + UIPACK_CONSTANTS.label_front_gap);
        self.text.setAttribute("scale", [this.data.text_scale, this.data.text_scale, this.data.text_scale].join(" "));


        self.text.setAttribute("visible", "false");
        self.text_rect.setAttribute("visible", "false");

        self.open = false;

        self.el.appendChild(self.text);
        self.el.appendChild(self.text_rect);

        // Only with data.text, we draw a button to show/hide it

        self.icon = document.createElement("a-entity");

        self.icon.setAttribute("uipack-button", AFRAME.utils.styleParser.stringify({icon_name: "flat/info", "pitch": 0, "yaw": 0}));

        this.el.appendChild(self.icon);


        // On font-loaded

        self.text.addEventListener("font-loaded", function(){

              var font_factor = UIPACK_CONSTANTS.font_scaling * self.data.text_scale;

              var height = self.text.object3D.children[0].geometry.layout._height;

              self.text.setAttribute("position", -(self.data.width*0.9/2) + " " +  (-height*font_factor - UIPACK_CONSTANTS.button_radius*2 ) + " " + UIPACK_CONSTANTS.label_front_gap);

              var rect_height = height*font_factor*1.2;

              self.text_rect.setAttribute("width", self.data.width);
              self.text_rect.setAttribute("height", rect_height);

              self.text_rect.setAttribute("position", 0 + " " + (-(rect_height/2) - UIPACK_CONSTANTS.button_radius*2) +" 0");

        });


        // On icon clicked

        self.icon.addEventListener("clicked", function(e) {

                        if(!self.open) {

                            self.text.setAttribute("visible", "true");
                            self.text_rect.setAttribute("visible", "true");

                            // Change icon to 'close' icon and flag it

                            AFRAME.utils.entity.setComponentProperty(self.icon, "uipack-button.icon_name", "flat/cancel-1");

                            self.open = true;

                        }
                        else {

                            self.text.setAttribute("visible", "false");
                            self.text_rect.setAttribute("visible", "false");

                            // Change icon to 'close'

                            AFRAME.utils.entity.setComponentProperty(self.icon, "uipack-button.icon_name", "flat/info");

                            self.open = false;

                        }

                    }, false);


    }

  },

//
//  /**
//   * Called when component is attached and when component data changes.
//   * Generally modifies the entity based on the data.
//   */

  update: function (oldData) {

    var self = this;

    // Position element

    self.y_position = UIPACK_CONSTANTS.label_distance * Math.sin(this.data.pitch * Math.PI/180.0);
    self.x_position = UIPACK_CONSTANTS.label_distance * Math.cos(this.data.pitch * Math.PI/180.0) * Math.cos(this.data.yaw * Math.PI/180.0);
    self.z_position = -UIPACK_CONSTANTS.label_distance * Math.cos(this.data.pitch * Math.PI/180.0)* Math.sin(this.data.yaw * Math.PI/180.0);

    // Change background colors

    if (self.data.text != "") {
        self.text_rect.setAttribute("color", self.data.text_background);
    }

    self.title_rect.setAttribute("color", self.data.title_background);

    // BMFONT texts updates are NOT YET IMPLEMENTED in update

    // Update position

    this.el.setAttribute("position", [self.x_position, self.y_position, self.z_position].join(" "));

    this.el.object3D.lookAt(new THREE.Vector3( 0, 0, 0));

  },
  tick: function (t) {

  },

  pause: function () { },

  play: function () { }

});

