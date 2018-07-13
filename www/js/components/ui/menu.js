
AFRAME.registerComponent('uipack-menu', {
    schema: {
        icons: {type: 'array'},
        theme: {type: 'string', default: "dark"},
        buttons: {type: 'array', default: []},
        media_id: {type: 'string', default: ""},
        pitch: { type: 'number', default: -70},
        pitch_max: { type: 'number', default: -50},
        pitch_min: { type: 'number', default: -80},
        open: {type: 'boolean', default: false}

    },

  init: function () {

    var self = this;

    // Annotate pointer to camera on scene 'mounted' or on the fly it camera exists

    if(!('camera' in self.el.sceneEl)) {

        self.el.sceneEl.addEventListener("loaded", function (e) {
            self.camera = self.el.sceneEl.camera;
        });
    }
    else {
        self.camera = self.el.sceneEl.camera;
    }

    // Class the element

    self.el.classList.add("uipack");
    self.el.classList.add("uipack-menu");

    self.container = document.createElement("a-entity");

    self.el.appendChild(self.container);

    // Opening / (closing?) icon

    self.open_icon = document.createElement("a-entity");

    self.open_icon.classList.add("non_click_while_loading");

    self.open_icon.setAttribute("uipack-button", {icon_name: "bars.png"});

    self.container.appendChild(self.open_icon);

    // For keeping track of frame count in .tick()

    self.frame_count = 0;

    // Keep track of the whole component visibility based on user head pitch

    self.hidden = true;

    self.el.setAttribute("visible", !self.hidden);

    // Keeping track of whether the menu is open or not, to modify yaw or not

    self.open_menu = false;

    self.menu_group = document.createElement("a-entity");

    // Hide menu group at start (closed menu)

    self.menu_group.setAttribute("visible", false);

    self.container.appendChild(self.menu_group);

    // Arrays to store icon + button references

    self.icon_row = [];

    self.button_row = [];

    // Create icon row

    for(var i=0; i < self.data.icons.length; i++){

        var my_icon = document.createElement("a-entity");

        my_icon.icon_index = i;

        my_icon.classList.add("non_click_while_loading");

        my_icon.addEventListener("clicked", function(){
            if(self.open_menu && (!self.hidden)) {
                self.el.emit("clicked", {'type': "icon", "index": this.icon_index}, false);
            }
        });

        self.icon_row.push(my_icon);

        self.menu_group.appendChild(my_icon);
    }

    // Create button row

    // First create button parent to control centering

    self.button_parent = document.createElement("a-entity");

    self.menu_group.appendChild(self.button_parent);

    for(i=0; i < self.data.buttons.length; i++){

        var my_button = document.createElement("a-entity");

        my_button.button_index = i;

        my_button.addEventListener("clicked", function(){
            if(self.open_menu && (!self.hidden)) {

                self.el.emit("clicked", {'type': "button", "index": this.button_index}, false);
            }
        });

        self.button_row.push(my_button);

        self.button_parent.appendChild(my_button);
    }

    // Create player (if needed)

    if(self.data.media_id != ""){
        // LATER. Special version of video-controls?

        self.media_controls = document.createElement("a-entity");
        self.menu_group.appendChild(self.media_controls);
    }

    // Open/Close menu event

    self.open_icon.addEventListener("clicked", function(){

        // Close menu

        if(self.open_menu){

            // View the open icon and hide menu
            self.menu_group.setAttribute("visible", false);

            // Close icon should be now a menu icon

            self.open_icon.setAttribute("uipack-button", "icon_name", "bars.png");

            // Mark menu as closed

            self.open_menu = false;
        }

        // Open menu

        else {

            // Make visible the group

            self.menu_group.setAttribute("visible", true);

            // Open icon should be now a 'close'

            self.open_icon.setAttribute("uipack-button", "icon_name", "close.png");

            // Mark menu as open

            self.open_menu = true;
        }

    });

  },
  remove: function(){

  },

  update: function (oldData) {

    var self = this;

    // Position icons

    var icon_row_half_width = ((self.icon_row.length-1)*(DATAVERSE.UIPACK_CONSTANTS.button_radius*2) + (self.icon_row.length - 1) * DATAVERSE.UIPACK_CONSTANTS.icon_spacing)/2.0;

    for(var i=0; i< self.icon_row.length; i++){

      self.icon_row[i].setAttribute("uipack-button", {icon_name: self.data.icons[i]});

      self.icon_row[i].setAttribute("position", (i*(DATAVERSE.UIPACK_CONSTANTS.button_radius*2 +DATAVERSE.UIPACK_CONSTANTS.icon_spacing )) - icon_row_half_width + " " +  DATAVERSE.UIPACK_CONSTANTS.offset_icons +" 0");
    }

    // Position text buttons

    // button_parent

    var button_row_half_width = ((self.button_row.length-1)*(DATAVERSE.UIPACK_CONSTANTS.menu_button_width) + (self.button_row.length - 1) * DATAVERSE.UIPACK_CONSTANTS.button_spacing)/2.0;

    for(i=0; i< self.button_row.length; i++){

      self.button_row[i].setAttribute("uipack-textbutton", {text: self.data.buttons[i], width: DATAVERSE.UIPACK_CONSTANTS.menu_button_width, color: "#FFF", background: "#000"});

      self.button_row[i].setAttribute("position", (i*(DATAVERSE.UIPACK_CONSTANTS.menu_button_width + DATAVERSE.UIPACK_CONSTANTS.button_spacing )) - button_row_half_width + " " +  DATAVERSE.UIPACK_CONSTANTS.offset_buttons +" 0");
    }


    // Position video control if exists

    if(self.data.media_id != "") {

        self.media_controls.setAttribute("uipack-mediacontrols", {'src': "#" + self.data.media_id,
            width: DATAVERSE.UIPACK_CONSTANTS.menu_player_width,
            height: DATAVERSE.UIPACK_CONSTANTS.menu_player_height,
            theme: self.data.theme,
            button_radius: DATAVERSE.UIPACK_CONSTANTS.menu_player_button_radius});

        self.media_controls.setAttribute("position", "0 " + DATAVERSE.UIPACK_CONSTANTS.offset_player + " 0");
    }

    // If data.open, emulate open menu

    if(self.data.open) {

            // Make visible the group

            self.menu_group.setAttribute("visible", true);

            // Open icon should be now a 'close'

            self.open_icon.setAttribute("uipack-button", "icon_name", "close.png");

            // Mark menu as open

            self.open_menu = true;

            self.hidden = false;

    }


  },

  tick: function (t) {

      var self = this;

      self.frame_count++;

      if(self.frame_count % DATAVERSE.UIPACK_CONSTANTS.menu_tick_check == 0){

        // Get camera pitch and yaw

        var camera_rotation = this.el.sceneEl.camera.el.getAttribute("rotation");

        var camera_yaw = camera_rotation.y + 90;

        var camera_pitch = camera_rotation.x;

        // If pitch in configured range, show menu, else hide (only id menu is closed)

        if(camera_pitch <  self.data.pitch_max && camera_pitch > self.data.pitch_min){

                self.hidden = false;
        }
        else {

            if(!(self.open_menu)) {

                self.hidden = true;
            }
        }

        self.el.setAttribute("visible", !self.hidden);

        // Emulate 'look into menu' if open on init

        if(self.data.open) {

            console.log("camera rotation", camera_rotation, camera_yaw);

            self.y_position = DATAVERSE.UIPACK_CONSTANTS.menu_distance * Math.sin(this.data.pitch * Math.PI / 180.0);
            self.x_position = DATAVERSE.UIPACK_CONSTANTS.menu_distance * Math.cos(this.data.pitch * Math.PI / 180.0) * Math.cos(camera_yaw * Math.PI / 180.0);
            self.z_position = -DATAVERSE.UIPACK_CONSTANTS.menu_distance * Math.cos(this.data.pitch * Math.PI / 180.0) * Math.sin(camera_yaw * Math.PI / 180.0);

            this.container.setAttribute("position", [self.x_position, self.y_position, self.z_position].join(" "));

            if (self.camera) {

                var cam_position = self.camera.el.getAttribute("position");

                self.el.setAttribute("position", {x: cam_position.x, y: cam_position.y, z: cam_position.z});

                self.container.setAttribute("rotation", {x: this.data.pitch, y: camera_rotation.y, z: 0});

                self.data.open = false;

            }
        }


        // If menu closed but visible: synch rotation and position with camera

        if(!(self.open_menu) && !(self.hidden)) {

            // Set position of menu based on camera yaw and data.pitch

            self.y_position = DATAVERSE.UIPACK_CONSTANTS.menu_distance * Math.sin(this.data.pitch * Math.PI / 180.0);
            self.x_position = DATAVERSE.UIPACK_CONSTANTS.menu_distance * Math.cos(this.data.pitch * Math.PI / 180.0) * Math.cos(camera_yaw * Math.PI / 180.0);
            self.z_position = -DATAVERSE.UIPACK_CONSTANTS.menu_distance * Math.cos(this.data.pitch * Math.PI / 180.0) * Math.sin(camera_yaw * Math.PI / 180.0);

            this.container.setAttribute("position", [self.x_position, self.y_position, self.z_position].join(" "));

            // And again, face camera and pos

            if(self.camera) {

                var cam_position = self.camera.el.getAttribute("position");

                self.el.setAttribute("position",{x: cam_position.x, y: cam_position.y, z: cam_position.z});
                self.container.setAttribute("rotation",{x: camera_rotation.x, y: camera_rotation.y, z: 0});

            }


        }
        else {

            // If menu open, just synch camera position

            if(self.open_menu && (!self.hidden)){

                if(self.camera) {

                    var cam_position = self.camera.el.getAttribute("position");

                    self.el.setAttribute("position",{x: cam_position.x, y: cam_position.y, z: cam_position.z});

                }


            }
        }

      }

  }
});

