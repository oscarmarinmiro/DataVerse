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

        self.scene = document.querySelector("a-scene");

        if(self.main.options.debug) {
            self.scene.setAttribute("stats", "");
        }

        self.assets = document.createElement("a-assets");

        self.scene.appendChild(self.assets);



    },

    // Renders auxiliary elements: lights, themes, floor, audio, etc..

    'render_aux_assets': function(){

        var self = this;

        // TODO: THEMES module

        self.ambient_light = document.createElement("a-entity");
        self.ambient_light.setAttribute("light", {type:"ambient", color: "#AAA"});

        self.directional_light = document.createElement("a-entity");
        self.directional_light.setAttribute("light", {type:"directional", color: "#EEE", intensity: 0.5});
        self.directional_light.setAttribute("position", {x:1, y:10, z:-1});

        self.vive_controls = document.createElement("a-entity");

        self.vive_controls.setAttribute("vive-controls", {hand: "right"});
        self.vive_controls.setAttribute("teleport_controls", true);

        self.camera = document.createElement("a-camera");

        self.cursor = document.createElement("a-cursor");
        self.cursor.setAttribute("color", "yellow");
        self.cursor.setAttribute("raycaster", {near: 0.0, objects: ".clickable"});
        self.cursor.setAttribute("fuse", true);
        self.cursor.setAttribute("fuse-timeout", 1000);


        self.camera.appendChild(self.cursor);

        self.scene.appendChild(self.camera);
        self.scene.appendChild(self.vive_controls);
        self.scene.appendChild(self.directional_light);
        self.scene.appendChild(self.ambient_light);


    },


    // Renders a scene

    'render_scene': function(){

        var self = this;

        console.log("RENDERING SCENE");
        console.log(self.main.state.state.actual_scene, self.main.state);

        console.log("REMOVING SCENE ELEMENTS", self.scene);

        // Removing last scene children, if any

        console.log("CHILDREN", self.scene.children);

        var to_delete = [];

        for(var i=0; i < self.scene.children.length; i++){

            var child = self.scene.children[i];

                if (!((child.hasAttribute("data-aframe-canvas")=== true)|| (child.hasAttribute("aframe-injected")=== true))){
                    to_delete.push(child);
                }
        }

        to_delete.forEach(function(child){
            self.scene.removeChild(child);
        });

        self.assets = document.createElement("a-assets");

        self.scene.appendChild(self.assets);

        // Insert scene component

        self.actual_scene_data = self.main.state.state.scenes[self.main.state.state.actual_scene];

        console.log("COMPONENTS");

        console.log(AFRAME.components);

        // Check that component is registered, else.. croack

        if(!(self.actual_scene_data.type in AFRAME.components)){

            self.main.croak("Invalid type of scene in row " + (self.main.state.state.actual_scene + 2) + ": " + self.actual_scene_data.type);

        }
        else {

            console.log("CREATING SCENE");

            self.render_aux_assets();
            self.actual_scene_component = document.createElement("a-entity");

            var my_params = AFRAME.utils.styleParser.parse(self.actual_scene_data.params);

            my_params.title = self.actual_scene_data.title;
            my_params.explain = self.actual_scene_data.explain;
            my_params.source = self.main.state.state.scenes_data_source;
            my_params.tab = self.actual_scene_data.tab;

            // console.log("LE ENCHUFO SOURCE", )


           // Set sky

           // color ?

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

                if(self.actual_scene_data.background) {

                    self.sky = document.createElement("a-sky");
                    self.sky.setAttribute("color", self.actual_scene_data.background);

                    self.scene.appendChild(self.sky);
                }
            }

            // TODO: audio and scene sky (color or 360 background);

            console.log("my params", my_params);

            self.actual_scene_component.setAttribute(self.actual_scene_data.type, my_params);

            self.scene.appendChild(self.actual_scene_component);
        }

     }

};