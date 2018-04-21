var DATAVERSE = DATAVERSE || {};

DATAVERSE.renderer = function(options, parent){

    var self = this;

    // Pointer to parent

    self.main = parent;

    self.options = options;


};


DATAVERSE.renderer.prototype = {

    'init_scenes': function(){

        var self = this;

        console.log("INIT SCENES");

        self.scene = document.createElement("a-scene");

        if(self.main.options.debug) {
            self.scene.setAttribute("stats", "");
        }

        document.body.appendChild(self.scene);

        self.assets = document.createElement("a-assets");

        self.scene.appendChild(self.assets);



    },

    // Renders a scene

    'render_scene': function(){

        var self = this;

        console.log("RENDERING SCENE");
        console.log(self.main.state.state.actual_scene, self.main.state);

        console.log("REMOVING SCENE ELEMENTS", self.scene);

        // Removing last scene children, if any

        while (self.scene.firstChild) {
               self.scene.removeChild(self.scene.firstChild);
        }

        self.assets = document.createElement("a-assets");

        self.scene.appendChild(self.assets);

        // Vive controls

      // <!--<a-entity vive-controls="hand: left"></a-entity>-->
      // <!--<!--<a-entity vive-controls="hand: right" controller-cursor raycaster="objects: #sphere"></a-entity>-->
      //
      // <!--<a-entity vive-controls="hand: right" teleport-controls></a-entity>-->

        // Removing last scene assets, if any

        // Insert scene component

        self.actual_scene_data = self.main.state.state.scenes[self.main.state.state.actual_scene];

        console.log("ASD", self.actual_scene_data);

        console.log("COMPONENTS");

        console.log(AFRAME.components);

        // Check that component is registered, else.. croack

        if(!(self.actual_scene_data.type in AFRAME.components)){

            self.main.croak("Invalid type of scene in row " + (self.main.state.state.actual_scene + 2) + ": " + self.actual_scene_data.type);

        }
        else {
            self.actual_scene_component = document.createElement("a-entity");

            var my_params = AFRAME.utils.styleParser.parse(self.actual_scene_data.params);

            my_params.source = self.actual_scene_data.source;
            my_params.title = self.actual_scene_data.title;
            my_params.explain = self.actual_scene_data.explain;

//            // Set sky
//
//            // color ?
//
            // Assume an image if background contains a dot

            if(self.actual_scene_data.background.indexOf('.')!=-1){

                self.sky_img = document.createElement("img");
                self.sky_img.setAttribute("src", self.actual_scene_data.background);
                self.sky_img.setAttribute("id", "sky_img");

                self.assets.appendChild(self.sky_img);

                self.sky = document.createElement("a-sky");
                self.sky.setAttribute("src", "#sky_img");

                self.scene.appendChild(self.sky);


            }
            else {

                self.sky = document.createElement("a-sky");
                self.sky.setAttribute("color", self.actual_scene_data.background);

                self.scene.appendChild(self.sky);
            }

            // TODO: audio and scene sky (color or 360 background);

            console.log("my params", my_params);

            self.actual_scene_component.setAttribute(self.actual_scene_data.type, my_params);

            self.scene.appendChild(self.actual_scene_component);
        }

     }

};