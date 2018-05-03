
AFRAME.registerComponent('uipack-infolabel', {
    schema: {
        yaw: { type: 'number', default: 0.0},
        elevation: { type: 'number', default: UIPACK_CONSTANTS.label_elevation},
        distance: {type: 'number', default: UIPACK_CONSTANTS.label_distance},
        width: {type: 'number', default: UIPACK_CONSTANTS.label_width},
        title: { type: 'string', default:""},
        title_scale: { type: 'number', default: 1.0},
        text: { type: 'string', default:""},
        text_scale: { type: 'number', default: 0.5},
        color: { type: 'string', default: "#FFF"},
        background: { type: 'string', default: "#000"}
    },

  init: function () {


    var self = this;

    // Class the element

    this.el.setAttribute("class", "uipack uipack-thumbnail");

    self.title = document.createElement("a-entity");

    self.title.setAttribute("text", {
                   'align': 'center',
                   'width': self.data.width,
                   'value': "\n" + self.data.title + "\n\n"
                });

    self.title.setAttribute("geometry", {
        'primitive': 'plane',
        'height': 'auto',
        'width': 'auto'
    });

    self.title.setAttribute("material", {
        'color': self.data.background
    });




    self.el.appendChild(self.title);


    // If text exists, draw it + background rect

    if (self.data.text != ""){

          // Create text, hide and append

          self.text = document.createElement("a-entity");

          self.text.setAttribute("text", {
                       'align': 'center',
                       'width': self.data.width,
                       'value': "\n" + self.data.text + "\n\n"
          });

          self.text.setAttribute("geometry", {
                'primitive': 'plane',
                'height': 'auto',
                'width': 'auto'
          });

          self.text.setAttribute("material", {
                'color': self.data.background
          });


          self.text.addEventListener("textfontset", function(){

              console.log(self.title.getAttribute("geometry"));

              if(self.title.getAttribute("geometry").height !== undefined){
                  self.text.setAttribute("position", {x:0, y: - (self.title.getAttribute("geometry").height + self.text.getAttribute("geometry").height/2), z: 0})
                  self.icon.setAttribute("position", {x:0, y: -self.title.getAttribute("geometry").height/2, z:0});

              }
              else {
                  self.title.addEventListener("textfontset", function(){
                    self.text.setAttribute("position", {x:0, y: - (self.title.getAttribute("geometry").height + self.text.getAttribute("geometry").height/2), z: 0})
                    self.icon.setAttribute("position", {x:0, y: -self.title.getAttribute("geometry").height/2, z:0});
                  })
              }
          });

        self.text.setAttribute("visible", "false");

        self.open = false;

        self.el.appendChild(self.text);


        // Only with data.text, we draw a button to show/hide it

        self.icon = document.createElement("a-entity");

        self.icon.setAttribute("uipack-button", {icon_name: "info.png", "pitch": 0, "yaw": 0});

        this.el.appendChild(self.icon);

        // On icon clicked

        self.icon.addEventListener("clicked", function(e) {

                        if(!self.open) {

                            self.text.setAttribute("visible", "true");

                            // Change icon to 'close' icon and flag it

                            self.icon.setAttribute("uipack-button", {icon_name: "close.png"});

                            self.open = true;

                        }
                        else {

                            self.text.setAttribute("visible", "false");

                            // Change icon to 'close'

                            self.icon.setAttribute("uipack-button", {icon_name: "info.png"});

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

    self.x_position = self.data.distance * Math.cos(this.data.yaw * Math.PI/180.0);
    self.y_position = self.data.elevation;
    self.z_position = -self.data.distance * Math.sin(this.data.yaw * Math.PI/180.0);

    self.el.setAttribute("rotation", {x: 0, y: this.data.yaw - 90, z: 0});


    // Rotate!!

    this.el.setAttribute("position", {x: self.x_position, y: self.y_position, z: self.z_position});


    // Change texts, colors and widths

    self.title.setAttribute("text", {
                   'color': self.data.color,
                   'width': self.data.width,
                   'value': "\n" + self.data.title + "\n\n"

    }, false);

    self.title.setAttribute("material", {
        'color': self.data.background
    }, false);

    // Offset a little texts to not fight for 'z' with button

    self.title.setAttribute("position", {x:0, y:0, z: -UIPACK_CONSTANTS.button_offset});


    // Change background colors

    if (self.data.text != "") {
        self.text.setAttribute("text", {
                       'color': self.data.color,
                       'width': self.data.width,
                       'value': "\n" + self.data.text + "\n\n"

        }, false);

        self.text.setAttribute("material", {
            'color': self.data.background
        }, false);

        // Offset a little texts to not fight for 'z' with button

        self.text.setAttribute("position", {x:0, y:0, z: -UIPACK_CONSTANTS.button_offset});

    }



  },
  tick: function (t) {

  },

  pause: function () { },

  play: function () { }

});

