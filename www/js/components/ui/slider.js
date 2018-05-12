
AFRAME.registerComponent('uipack-slider', {
    schema: {
        pitch: { type: 'number', default: -45},
        distance: { type: 'number', default: 2.5},
        interval: { type: 'number', default: 1000},
        steps: {type: 'number', default: 32},
        size: { type: 'number', default: 2.0},
        frame_ticks: { type: 'number', default: 1},
        backgroundColor: { default: 'black'},
        barColor: { default: 'red'},
        textColor: { default: 'yellow'},
        statusTextFont: { default: '40px Helvetica Neue'},
        timeTextFont: { default: '70px Helvetica Neue'}
    },

  init: function () {

    var self = this;

    console.log("INIT SLIDER");

    self.frame_count = 0;

    self.step = 0;

    self.playing = false;

    // Class the element

    self.el.setAttribute("class", "uipack uipack-slider clickable");

    self.container = document.createElement("a-entity");

    self.el.appendChild(self.container);

    // Annotate pointer to camera on scene 'mounted' or on the fly it camera exists

    if(!('camera' in self.el.sceneEl)) {

        self.el.sceneEl.addEventListener("loaded", function (e) {

            self.set_container_et_al();

        });
    }
    else {

        self.set_container_et_al();
    }


  },
  refresh_progress: function(){

           var self = this;

//         var time_info_text = current_minutes + ":" + current_seconds + " / " + duration_minutes + ":" + duration_seconds;

            //  Refresh transport bar canvas

            var inc = self.bar_canvas.width / self.data.steps;


            var ctx = self.context;
            ctx.fillStyle = this.data.backgroundColor;
            ctx.fillRect(0, 0, this.bar_canvas.width, this.bar_canvas.height);

//                // Uncomment to draw a single bar for loaded data instead of 'bins'
//
//                //                ctx.fillStyle = "grey";
//                //
//                //                ctx.fillRect(0, 0,
//                //                    (this.video_el.buffered.end(this.video_el.buffered.length - 1) / this.video_el.duration)*this.bar_canvas.width,
//                //                    this.bar_canvas.height/2);
//
//
//
//                // Display time info text
//
//                ctx.font = this.data.timeTextFont;
//                ctx.fillStyle = "white";
//                ctx.textAlign = "center";
//                ctx.fillText(time_info_text, this.bar_canvas.width/2, this.bar_canvas.height* 0.80);
//
//                // DEBUG PURPOSES
//
////                ctx.fillText(this.video_el.readyState, this.bar_canvas.width*0.1, this.bar_canvas.height* 0.65);
//
//                // If seeking to position, show
//
//                if(this.video_el.seeking){
//                    ctx.font = this.data.statusTextFont;
//                    ctx.fillStyle = this.data.textColor;
//                    ctx.textAlign = "end";
//                    ctx.fillText("Seeking", this.bar_canvas.width * 0.95, this.bar_canvas.height * 0.75);
//                }
//
//                // Uncomment below to see % of video loaded...
//
//                else {
//
//                    var percent = (this.video_el.buffered.end(this.video_el.buffered.length - 1) / this.video_el.duration) * 100;
//
//                    ctx.font = this.data.statusTextFont;
//                    ctx.fillStyle = this.data.textColor;
//                    ctx.textAlign = "end";
//
//                    ctx.fillText(percent.toFixed(0) + "% loaded", this.bar_canvas.width * 0.95, this.bar_canvas.height * 0.75);
//                }
//

//                // Show buffered ranges 'bins'
//
//                for (var i = 0; i < this.video_el.buffered.length; i++) {
//
//                    var startX = this.video_el.buffered.start(i) * inc;
//                    var endX = this.video_el.buffered.end(i) * inc;
//                    var width = endX - startX;
//
//                    ctx.fillStyle = "grey";
//                    ctx.fillRect(startX, 0, width, this.bar_canvas.height/3);
//
//                }

                // Red bar with already played range

                ctx.fillStyle = this.data.barColor;
                ctx.fillRect(0, 0,
                    (self.step / (self.data.steps-1))*this.bar_canvas.width,
                    this.bar_canvas.height);

                console.log("STEP",(self.step / self.data.steps)*this.bar_canvas.width);

//            }


            // If material is not mapped yet to canvas texture and bar object3D is ready
            // assign canvas as a texture

            if(this.bar.object3D.children.length > 0) {

                // If material is not mapped yet to canvas texture...

                if(this.bar.object3D.children[0].material.map === null) {
                    this.bar.object3D.children[0].material = new THREE.MeshBasicMaterial();
                    this.bar.object3D.children[0].material.map = this.texture;
                }

                this.texture.needsUpdate = true;
            }

  },
  set_callback: function(callback){
        var self = this;

        self.callback = callback;

        console.log("SETTING CALLBACK", self.data, callback);

  },
  set_container_et_al: function(){

        var self = this;

        self.camera = self.el.sceneEl.camera;

        // Get camera pitch and yaw

        var camera_rotation = self.camera.el.getAttribute("rotation");

        var camera_yaw = camera_rotation.y + 90;

        var camera_pitch = camera_rotation.x;


        // If menu closed but visible: synch rotation and position with camera

        // Set position of menu based on camera yaw and data.pitch

        self.y_position = self.data.distance * Math.sin(this.data.pitch * Math.PI / 180.0);
        self.x_position = self.data.distance * Math.cos(this.data.pitch * Math.PI / 180.0) * Math.cos(camera_yaw * Math.PI / 180.0);
        self.z_position = -self.data.distance * Math.cos(this.data.pitch * Math.PI / 180.0) * Math.sin(camera_yaw * Math.PI / 180.0);

        console.log("POSITIONS", self.x_position, self.y_position, self.z_position);

        self.container.setAttribute("position", [self.x_position, self.y_position, self.z_position].join(" "));

        // And again, face camera and pos

        var cam_position = self.camera.el.getAttribute("position");

        self.el.setAttribute("position", {x: cam_position.x, y: cam_position.y, z: cam_position.z});

        // Insert button

        self.icon = document.createElement("a-entity");

        self.icon.setAttribute("uipack-button", {icon_name : UIPACK_CONSTANTS.play_icon, radius: 0.2});

        self.container.appendChild(self.icon);


        self.icon.addEventListener('clicked', function (event) {

            if(self.playing){

                self.pause();
            }
            else {

                self.play();
            }

        });


        // Insert bar

        self.bar_canvas = document.createElement("canvas");
        self.bar_canvas.setAttribute("id", "slider_canvas");
        self.bar_canvas.width = 1024;
        self.bar_canvas.height = 256;
        self.bar_canvas.style.display = "none";

        self.context = self.bar_canvas.getContext('2d');

        self.texture = new THREE.Texture(self.bar_canvas);


        self.bar = document.createElement("a-plane");
        this.bar.setAttribute("color", "#000");

        // On transport bar click, get point clicked, infer % of new pointer, and make video seek to that point

        self.bar.addEventListener('click', function (event) {

            // Get raycast intersection point, and from there, x_offset in bar

            var point = document.querySelector("a-cursor").components.raycaster.raycaster.intersectObject(this.object3D, true)[0].point;

            var x_offset = this.object3D.worldToLocal(point).x;

            var unit_offset = (x_offset/self.data.size)+0.5;

            self.step = Math.floor(unit_offset * self.data.steps);

            self.refresh_progress();

            self.callback(self.step);


            console.warn("click", unit_offset, x_offset, self.data.size);
//
//            // Update current step for coherence between point+click and key methods
//
//            self.current_step = Math.round(unit_offset*self.bar_steps);
//
//            if(self.video_el.readyState > 0) {
//
//                self.video_el.currentTime = unit_offset * self.video_el.duration;
//            }
//
//            // Prevent propagation upwards (e.g: canvas click)
//
//            event.stopPropagation();
//
//            event.preventDefault();

        });


        self.container.appendChild(self.bar);
        self.container.appendChild(self.bar_canvas);



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

    self.bar.setAttribute("height", this.data.size/8.0);
    self.bar.setAttribute("width", this.data.size);
    self.bar.setAttribute("position", "0.0 0.0 0");

    self.icon.setAttribute("position", (-this.data.size/2.0)*1.4 + " 0 0");


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

      // The component only inherits position from camera. Container is at a fixed distance

      self.frame_count++;

      if(self.frame_count % self.data.frame_ticks == 0){

            if(self.camera) {

                var cam_position = self.camera.el.getAttribute("position");

                self.el.setAttribute("position",{x: cam_position.x, y: cam_position.y, z: cam_position.z});

            }

      }

  },

  /**
   * Called when entity pauses.
   * Use to stop or remove any dynamic or background behavior such as events.
   */
  pause: function () {

      var self = this;

      if(self.playing) {

          self.icon.setAttribute("uipack-button", {icon_name : UIPACK_CONSTANTS.play_icon, radius: 0.2});
          clearInterval(self.my_timer);

          self.playing = false;
      }

  },

  /**
   * Called when entity resumes.
   * Use to continue or add any dynamic or background behavior such as events.
   */
  play: function () {

        var self = this;

        if(!self.playing) {

            self.playing = true;

            // Reset steps if at the end...

            if(self.step >= self.data.steps){
                self.step = 0;
            }

            self.icon.setAttribute("uipack-button", {icon_name : UIPACK_CONSTANTS.pause_icon, radius: 0.2});

            self.my_timer = setInterval(function () {

                self.refresh_progress();

                self.callback(self.step);

                self.step++;

                if (self.step > (self.data.steps - 1)) {
                    self.pause();

                    console.warn("SELF STEP QUEDA", self.step, self.data);
                }

            }, self.data.interval);
        }
  }
});

