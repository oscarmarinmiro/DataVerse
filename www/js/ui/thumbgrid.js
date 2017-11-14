/**
 * Created by Oscar on 14/08/16.
 */

//
// init: aux canvases (text + button
// update first: Put thumbnail in button + text
// click: start animation of stroke
// tick: check pressed or looked-out
// pressed: call callback



if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

var UIPACK_CALLBACKS = UIPACK_CALLBACKS || {};

var UIPACK_CONSTANTS = UIPACK_CONSTANTS || {};


/**
 ** Presence UI-button
 */

AFRAME.registerComponent('uipack-thumbgrid', {
    schema: {
        pitch: { type: 'number', default: 0.0},
        yaw: { type: 'number', default: 0.0},
        fov_h: { type: 'number', default: 120.0},
        aspect_ratio: { type: 'number', default: 2.0},
        size_h: { type: 'number', default: 3},
        size_v: { type: 'number', default: 2},
        shape: {'type': 'string', default: "square"},
        thumbnails: { type: 'array'},
        codes: { type: 'array'}
    },

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {

    var self = this;

    self.page = 0;
    self.number_of_pages = Math.ceil(self.data.thumbnails.length / (self.data.size_h * self.data.size_v));

    self.thumbnail_objs = [];
    self.total_thumbnails = self.data.size_h * self.data.size_v;

    // Horizonal size is calculated with fov_h / number of columns in grid

    self.horizontal_size = 2 * UIPACK_CONSTANTS.thumbnail_distance * Math.tan(((self.data.fov_h / self.data.size_h)*Math.PI/180)/2);

    // For vertical size: if 'square' : calculate angle and size based on aspect ratio. If 'radio, then horizontal_size = vertical_size

    self.vertical_size = self.data.shape == "square" ? (self.horizontal_size / self.data.aspect_ratio) : self.horizontal_size;

    // Calculate pitch jump between thumbnail 'rows'

    self.vertical_angle_jump = 2 * Math.atan((self.vertical_size/2) /  UIPACK_CONSTANTS.thumbnail_distance ) * 180/Math.PI;

    self.fov_v = self.vertical_angle_jump * self.data.size_v;

    // 0.7 leaves a good margin between thumbnails. TODO: Put in a constant. TODO: Do a 'system' with all components

    self.real_width = self.horizontal_size * 0.7;
    self.real_height = self.vertical_size * 0.7;

    // create thumbnails, position them and 'fill' them

    for(var i=0; i < self.data.size_v; i++){

        var pitch =  self.data.pitch - ((i*(self.vertical_angle_jump)) + ((self.vertical_angle_jump)/2));

        for(var j=0; j < self.data.size_h; j++){

            var thumbnail_index = self.page*(self.data.size_h*self.data.size_v) + (i*self.data.size_h) + j;

            var yaw =  self.data.yaw - ((j * (self.data.fov_h / self.data.size_h)) + (self.data.fov_h / self.data.size_h)/2);

            var thumbnail = document.createElement("a-entity");

            if(self.data.shape == "square") {
                self.thumbnail_objs.push(thumbnail);

            }
            else {
                self.thumbnail_objs.push(thumbnail);
            }

            // Annotate index on thumbnail element

            thumbnail.thumbnail_index = thumbnail_index;


            // Emit 'clicked' on entity if icon 'clicked' and thus, thumbnail clicked

            thumbnail.addEventListener("clicked", function(e){
                 self.el.emit("clicked", {'thumbnail_index': this.thumbnail_index}, false);
            });

            this.el.appendChild(thumbnail);
        }


    }

    // Create the icons

    // Left icon

    self.left_icon = document.createElement("a-entity");

//          <!--<a-entity uipack-button="icon_name: interface/airplane; pitch:30.0; yaw:270.0" id="b"></a-entity>-->

    self.left_icon.addEventListener("clicked", function(e){

        if(self.page > 0) {
            self.page -= 1;
            self.update();
        }

    });

    this.el.appendChild(self.left_icon);

    // Right icon

    self.right_icon = document.createElement("a-entity");

    self.right_icon.addEventListener("clicked", function(e){

        if(self.page < self.number_of_pages -1 ) {
            self.page += 1;
            self.update();
        }

    });

    this.el.appendChild(self.right_icon);

    // 'Close' button

    self.close_icon = document.createElement("a-entity");

    self.close_icon.addEventListener("clicked", function(e){
        self.el.emit("closed", null, false);
    });

    this.el.appendChild(self.close_icon);

  },
//
//  /**
//   * Called when component is attached and when component data changes.
//   * Generally modifies the entity based on the data.
//   */
  update: function (oldData) {

    var self = this;

    // Update the icons

    // Left icon

    self.left_icon.setAttribute("uipack-button", AFRAME.utils.styleParser.stringify({absolute_pos: "true", icon_name: "flat/back-1", pitch: self.data.pitch - (self.fov_v/2), yaw: self.data.yaw}));

    // Right icon

    self.right_icon.setAttribute("uipack-button", AFRAME.utils.styleParser.stringify({absolute_pos: "true", icon_name: "flat/next-5", pitch: self.data.pitch - (self.fov_v/2), yaw: self.data.yaw - self.data.fov_h}));

    // 'Close' button

    self.close_icon.setAttribute("uipack-button", AFRAME.utils.styleParser.stringify({absolute_pos: "true", icon_name: "flat/cancel-1", pitch: self.data.pitch - (self.fov_v), yaw: self.data.yaw - (self.data.fov_h/2) }));


    // Update thumbnails CAVEAT: Update is *not* repositioning thumbnails, since it expects fov_h and sizes *NOT* to change

    for(var i=0; i < self.data.size_v; i++){

        var pitch =  self.data.pitch - ((i*(self.vertical_angle_jump)) + ((self.vertical_angle_jump)/2));

        for(var j=0; j < self.data.size_h; j++){

            var thumbnail_index = self.page*(self.data.size_h*self.data.size_v) + (i*self.data.size_h) + j;

            var yaw =  self.data.yaw - ((j * (self.data.fov_h / self.data.size_h)) + (self.data.fov_h / self.data.size_h)/2);

            var thumbnail = self.thumbnail_objs[(i*self.data.size_h) + j];

            if(self.data.shape == "square") {

                if(thumbnail_index < self.data.thumbnails.length) {
                    thumbnail.setAttribute("uipack-thumbnail", AFRAME.utils.styleParser.stringify({shape: "square", pitch: pitch, yaw: yaw, src: self.data.thumbnails[thumbnail_index], width: self.real_width, height: self.real_height}));
                    thumbnail.setAttribute("visible", "true");
                }
                else {
//                    thumbnail.setAttribute("uipack-thumbnail", AFRAME.utils.styleParser.stringify({shape: "square", pitch: pitch, yaw: yaw, src: "", width: self.real_width, height: self.real_height}));
                    thumbnail.setAttribute("visible", "false");
                }

            }
            else {

                if(thumbnail_index < self.data.thumbnails.length) {
                    thumbnail.setAttribute("uipack-thumbnail", AFRAME.utils.styleParser.stringify({shape: "round", pitch: pitch, yaw: yaw, src: self.data.thumbnails[thumbnail_index], radius: self.real_width < self.real_height ? self.real_width / 2 : self.real_height / 2}));
                    thumbnail.setAttribute("visible", "true");
                }
                else {
//                    thumbnail.setAttribute("uipack-thumbnail", AFRAME.utils.styleParser.stringify({shape: "round", pitch: pitch, yaw: yaw, src: "", radius: self.real_width < self.real_height ? self.real_width / 2 : self.real_height / 2}));
                    thumbnail.setAttribute("visible", "false");
                }
            }

        }

    }

    // Update arrow visibility based on page number

    self.left_icon.setAttribute("visible", self.page == 0 ? "false" : "true");
    self.right_icon.setAttribute("visible", self.page == self.number_of_pages - 1 ? "false" : "true");


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
