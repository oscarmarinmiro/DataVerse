
AFRAME.registerComponent('uipack-textbutton', {
        schema: {
            yaw: { type: 'number', default: 0.0},
            elevation: { type: 'number', default: DATAVERSE.UIPACK_CONSTANTS.button_elevation},
            distance: { type: 'number', default: DATAVERSE.UIPACK_CONSTANTS.button_distance},
            width: { type: 'number', default: 3.0},
            text: { type: 'string', default: ""},
            color: { type: 'string', default: "#000"},
            background: { type: 'string', default: "#FFF"}

        },


        init: function () {


            var self = this;

            // Create label

            self.text = document.createElement("a-entity");

            // Class the element

            this.el.setAttribute("class", "uipack uipack-textbutton");


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



            // Append

            self.el.appendChild(self.text);


            // Only with data.text, we draw a button to show/hide it

            self.icon = document.createElement("a-entity");

            self.icon.setAttribute("uipack-button", {icon_name: DATAVERSE.UIPACK_CONSTANTS.thumbnail_icon});

            self.el.appendChild(self.icon);

            // Reposition icon to acommodate rect height

            self.text.addEventListener("textfontset", function(){

              self.icon.setAttribute("position", {x:0, y: -self.text.getAttribute("geometry").height/2, z:DATAVERSE.UIPACK_CONSTANTS.label_front_gap});

            });

            // On icon clicked

            self.icon.addEventListener("clicked", function (e) {

                self.el.emit('clicked', null, false);

            }, false);


    },

  update: function (oldData) {

    var self = this;


    // If parent is scene, absolute positioning, else, leave position up to the user

    if(self.el.parentEl === self.el.sceneEl) {


            self.x_position = self.data.distance * Math.cos(this.data.yaw * Math.PI/180.0);
            self.y_position = self.data.elevation;
            self.z_position = -self.data.distance * Math.sin(this.data.yaw * Math.PI/180.0);

            this.el.setAttribute("rotation", {x: 0, y: this.data.yaw - 90, z: 0});

            this.el.setAttribute("position", [self.x_position, self.y_position, self.z_position].join(" "));


    }


    // Change background colors

    self.text.setAttribute("material", {
        'color': self.data.background
    }, false);

    self.text.setAttribute("text", {
               'align': 'center',
               'width': self.data.width,
               'color': self.data.color,
               'value': "\n" + self.data.text + "\n\n"
    });



  }
});

