
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

var UIPACK_CALLBACKS = UIPACK_CALLBACKS || {};

var UIPACK_CONSTANTS = UIPACK_CONSTANTS || {};

UIPACK_CONSTANTS.menu_distance = 3.0;

UIPACK_CONSTANTS.offset_player = 1.5;

UIPACK_CONSTANTS.offset_buttons = 0.9;

UIPACK_CONSTANTS.offset_icons = 0.3;

UIPACK_CONSTANTS.icon_spacing = 0.1;

UIPACK_CONSTANTS.button_spacing = 0.1;

UIPACK_CONSTANTS.menu_button_width = 1.3;


/**
 ** UI-thumbnail
 */


AFRAME.registerComponent('uipack-menu', {
    schema: {
        icons: {type: 'array'},
        buttons: {type: 'array'},
        media_id: {type: 'string', default: ""},
        pitch: { type: 'number', default: -70},
        pitch_max: { type: 'number', default: -50},
        pitch_min: { type: 'number', default: -80}

    },

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {

    var self = this;

    // Opening / (closing?) icon

    self.open_icon = document.createElement("a-entity");

    self.open_icon.setAttribute("uipack-button", AFRAME.utils.styleParser.stringify({icon_name: "flat/menu"}));

    self.el.appendChild(self.open_icon);

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

    self.el.appendChild(self.menu_group);

    // Arrays to store icon + button references

    self.icon_row = [];

    self.button_row = [];

    // Create icon row

    for(var i=0; i < self.data.icons.length; i++){

        var my_icon = document.createElement("a-entity");

        my_icon.icon_index = i;

        my_icon.addEventListener("clicked", function(){
            self.el.emit("clicked", {'type': "icon", "index": this.icon_index}, false);
        });

        self.icon_row.push(my_icon);

        self.menu_group.appendChild(my_icon);
    }

    // Create button row

    // First create button parent to control centering

    self.button_parent = document.createElement("a-entity");

    self.menu_group.appendChild(self.button_parent);

    for(var i=0; i < self.data.buttons.length; i++){

        var my_button = document.createElement("a-entity");

        my_button.button_index = i;

        my_button.addEventListener("clicked", function(){
            self.el.emit("clicked", {'type': "button", "index": this.button_index}, false);
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

            self.open_icon.setAttribute("uipack-button", "icon_name", "flat/menu");

            // Mark menu as closed

            self.open_menu = false;
        }

        // Open menu

        else {

            // Make visible the group

            self.menu_group.setAttribute("visible", true);

            // Open icon should be now a 'close'

            self.open_icon.setAttribute("uipack-button", "icon_name", "flat/cancel-1");

            // Mark menu as open

            self.open_menu = true;
        }

    });

  },
  remove: function(){

  },
//
//  /**
//   * Called when component is attached and when component data changes.
//   * Generally modifies the entity based on the data.
//   */
  update: function (oldData) {

    var self = this;

    // Position icons

    var icon_row_half_width = ((self.icon_row.length-1)*(UIPACK_CONSTANTS.button_radius*2) + (self.icon_row.length - 1) * UIPACK_CONSTANTS.icon_spacing)/2.0;

    for(var i=0; i< self.icon_row.length; i++){
      //          <!--<a-entity uipack-button="icon_name: interface/airplane; pitch:30.0; yaw:270.0" id="b"></a-entity>-->

      self.icon_row[i].setAttribute("uipack-button", {icon_name: self.data.icons[i]});

      self.icon_row[i].setAttribute("position", (i*(UIPACK_CONSTANTS.button_radius*2 +UIPACK_CONSTANTS.icon_spacing )) - icon_row_half_width + " " +  UIPACK_CONSTANTS.offset_icons +" 0");
    }

    // Position text buttons

    // button_parent

    var button_row_half_width = ((self.button_row.length-1)*(UIPACK_CONSTANTS.menu_button_width) + (self.button_row.length - 1) * UIPACK_CONSTANTS.button_spacing)/2.0;

    for(var i=0; i< self.icon_row.length; i++){
      //          <!--<a-entity uipack-button="icon_name: interface/airplane; pitch:30.0; yaw:270.0" id="b"></a-entity>-->

      self.button_row[i].setAttribute("uipack-textbutton", {text: self.data.buttons[i], width: UIPACK_CONSTANTS.menu_button_width, text_scale: 1.0, text_color: "#FFF", text_background: "#000"});

      self.button_row[i].setAttribute("position", (i*(UIPACK_CONSTANTS.menu_button_width + UIPACK_CONSTANTS.button_spacing )) - button_row_half_width + " " +  UIPACK_CONSTANTS.offset_buttons +" 0");
    }


    // Position video control if exists

    if(self.data.media_id != "") {

        self.media_controls.setAttribute("uipack-mediacontrols", {'src': "#" + self.data.media_id});

        self.media_controls.setAttribute("position", "0 " + UIPACK_CONSTANTS.offset_player + " 0");
    }

    // Lookat camera

    this.el.object3D.lookAt(new THREE.Vector3( 0, 0, 0));


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

      var self = this;

      self.frame_count++;

      if(self.frame_count % 25 == 0){

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


        // Only reposition following use look is menu is closed

        if(!(self.open_menu) && !(self.hidden)) {

            // Set position of menu based on camera yaw and data.pitch

            self.y_position = UIPACK_CONSTANTS.menu_distance * Math.sin(this.data.pitch * Math.PI / 180.0);
            self.x_position = UIPACK_CONSTANTS.menu_distance * Math.cos(this.data.pitch * Math.PI / 180.0) * Math.cos(camera_yaw * Math.PI / 180.0);
            self.z_position = -UIPACK_CONSTANTS.menu_distance * Math.cos(this.data.pitch * Math.PI / 180.0) * Math.sin(camera_yaw * Math.PI / 180.0);

            this.el.setAttribute("position", [self.x_position, self.y_position, self.z_position].join(" "));

            // And again, face to camera

            this.el.object3D.lookAt(new THREE.Vector3(0, 0, 0));
        }

      }

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

