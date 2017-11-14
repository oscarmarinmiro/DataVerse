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

        self.scene = document.createElement("a-scene");

        if(self.main.options.debug) {
            self.scene.setAttribute("stats", "");
        }

        document.body.appendChild(self.scene);

        self.assets = document.createElement("a-assets");

        self.scene.appendChild(self.assets);

        self.camera = document.createElement("a-camera");
        self.cursor = document.createElement("a-cursor");

        self.cursor.setAttribute("color", "grey");

        self.camera.appendChild(self.cursor);

        self.scene.appendChild(self.camera);

        self.sky = document.createElement("a-sky");

        self.scene.appendChild(self.sky);


    },

    // Renders all hotspot links

    'render_links': function(){

        var self = this;

        var scene_name = self.main.state.state.actual_scene;

        if(scene_name in self.main.state.state.links){

            console.log("RENDERIZANDO LOS LINKS", self.main.state.state.links[scene_name]);

            var links = self.main.state.state.links[scene_name];

            links.forEach(function(d,i){

                console.log("RENDERIZANDO LINK ", d);

                // Create ui thumbnail

                var thumbnail = document.createElement("a-entity");

                thumbnail.setAttribute("uipack-thumbnail", {
                    src: d.thumbnail,
                    yaw: d.yaw,
                    elevation: d.elevation,
                    distance: d.distance,
                    shape: DATAVERSE.constants.THUMBNAIL_SHAPE,
                    radius: DATAVERSE.constants.THUMBNAIL_RADIUS,
                    opacity: 0.85,
                    text: d.text,
                    destination: d.target
                });

                self.scene.appendChild(thumbnail);

                // Attach event

                thumbnail.addEventListener("clicked", function(e){

                    console.log("clickado");

                    console.log(e.detail);

                    // Change actual scene to destination

                    self.main.state.state.actual_scene = e.detail.destination;

                    self.render_scene();


                });


            });

        }

    },

    // Renders a scene

    'render_scene': function(){

        var self = this;

        console.log("RENDERING SCENE");
        console.log(self.main.state.state.actual_scene, self.main.state);

        console.log("REMOVING SCENE ELEMENTS", self.scene);

        // Removing last scene assets

        while (self.assets.firstChild) {
               self.assets.removeChild(self.assets.firstChild);
        }

        // Remove last component

        if (self.actual_scene_component) {
            self.scene.removeChild(self.actual_scene_component);
        }

        // Remove all UI elements

        document.querySelectorAll(".uipack").forEach(function(d,i){

            d.parentNode.removeChild(d);

        });

        // Render links

        self.render_links();

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

            // Propagate spreadsheet 'subtype' column to component 'type' param

            if(self.actual_scene_data.subtype.length > 1) my_params.type = self.actual_scene_data.subtype;

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

                self.sky.setAttribute("src", "#sky_img");


            }
            else {

                self.sky.setAttribute("color", self.actual_scene_data.background);

            }

            // TODO: audio and scene sky (color or 360 background);

            console.log("my params", my_params);

            // Set position and rotation from params, and delete from entity-specific params

            if("position" in my_params){
                self.actual_scene_component.setAttribute("position", my_params.position);
                delete(my_params.position);
            }

            if("rotation" in my_params){
                self.actual_scene_component.setAttribute("rotation", my_params.rotation);
                delete(my_params.rotation);
            }


            self.actual_scene_component.setAttribute(self.actual_scene_data.type, my_params);

            self.scene.appendChild(self.actual_scene_component);

            // Set scene

            self.main.urls.set_params({scene: self.main.state.state.actual_scene});

             var obj = { Title: "", Url: window.location.href};
             history.pushState(obj, obj.Title, obj.Url);

//            history.pushState({}, "", window.location.href);
        }

     }

};