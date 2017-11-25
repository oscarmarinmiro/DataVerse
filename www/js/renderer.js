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
        self.cursor.setAttribute("fuse", true);

        self.camera.appendChild(self.cursor);

        self.scene.appendChild(self.camera);

        self.sky = document.createElement("a-sky");

        self.scene.appendChild(self.sky);


    },

    // Renders all labels

    'render_labels': function() {

        var self = this;

        var scene_name = self.main.state.state.actual_scene;

        var labels = self.main.state.state.labels[scene_name];

        if(scene_name in self.main.state.state.labels) {

            labels.forEach(function (d, i) {

                var label = document.createElement("a-entity");

                label.setAttribute("uipack-infolabel", {
                    yaw: d.yaw,
                    elevation: d.elevation,
                    distance: d.distance,
                    title: d.title,
                    color: d.color,
                    background: d.background,
                    width: d.width,
                    text: d.text.length > 2 ? d.text : ""
                });

                self.scene.appendChild(label);

            });
        }

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

                    // Push scene in history and change actual scene to destination

                    self.main.state.state.scene_history.push(self.main.state.state.actual_scene);

                     var obj = { Title: "", Url: window.location.origin + window.location.pathname + "?scene=" + self.main.state.state.actual_scene};
                     history.pushState(obj, obj.Title, obj.Url);


                    self.main.state.state.actual_scene = e.detail.destination;

                    self.render_scene();

                });


            });

        }

    },

    'render_menu': function(media_id){

        var self = this;

        // Add menu

        self.menu = document.createElement("a-entity");

        var icons = self.main.state.state.scene_history.length == 0 ? {'icons': ["home.png"], 'names': ["home"]}: {'icons': ["arrow-left.png","home.png"], 'names': ["back","home"]};


        if(media_id!= null) {

            self.menu.setAttribute("uipack-menu", {

                icons: icons.icons, buttons: [], media_id: media_id

            });

        }
        else {

            self.menu.setAttribute("uipack-menu", {

                icons: icons.icons,  buttons: []

            });

        }

        self.scene.appendChild(self.menu);


        // Events...

        self.menu.addEventListener("clicked", function(e){

            // Home

            if(e.detail.type === "icon" && icons.names[e.detail.index] === "home"){

                console.log("CLICKADO HOME");

                // Push scene in history, and point to home scene

                self.main.state.state.scene_history.push(self.main.state.state.actual_scene);

                var obj = { Title: "", Url: window.location.origin + window.location.pathname + "?scene=" + self.main.state.state.actual_scene};
                history.pushState(obj, obj.Title, obj.Url);


                self.main.state.state.actual_scene = self.main.state.state.home_scene;

                self.render_scene();



//                console.log("SELF VIDEO EN ICON");
//                console.log(self.video);

//                if(self.video){
//                    self.video.node().pause();
//                }

//                self.clear_scene();
//
//                self.last_scene = self.scene_name;
//
//                self.land_scene(self.config.landing);

            }

            // TODO: real history stack of last_scene for 'back'. now after one back it's a loop

            if(e.detail.type === "icon" && icons.names[e.detail.index] === "back"){

                console.log("CLICKADO BACK");
                console.log(self.main.state.state.scene_history);

                if(self.main.state.state.scene_history.length > 0) {

                    var back_scene = self.main.state.state.scene_history.pop();

                    self.main.state.state.actual_scene = back_scene;

                    self.render_scene();
                }


//                self.clear_scene();
//
//                self.land_scene(self.last_scene);

            }

        });

    },


    // Renders a scene

    'render_scene': function(){

        var self = this;

        console.log("RENDERING SCENE");
        console.log(self.main.state.state.actual_scene, self.main.state);

        console.log("REMOVING SCENE ELEMENTS", self.scene);

        console.log("HISTORY", self.main.state.state.scene_history);

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

        // Insert scene component

        self.actual_scene_data = self.main.state.state.scenes[self.main.state.state.actual_scene];

//        // Update history
//
//        if(back_button){
//
//            self.main.state.state.scene_history.pop();
//        }
//        else {
//            self.main.state.state.scene_history.push(self.main.state.state.actual_scene);
//        }

        // Render links

        self.render_links();

        // Render labels

        self.render_labels();

//        // Render menu
//
//        self.render_menu();

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

            // Now launch menu: directly if no audio/video

            console.log("SCENE DATA", self.actual_scene_data);

            if(self.actual_scene_data.type === "video-viz"){

                // wait until video asset id is inserted, and then launch

                self.actual_scene_component.addEventListener("asset_added", function(e){

                        // Render menu with video_id

                        self.render_menu(e.detail.id);

                });


            }
            else {

                if(self.actual_scene_data.audio.length > 2) {

                    self.audio = document.createElement("audio");

                    self.audio.setAttribute("src", self.actual_scene_data.audio);
                    self.audio.setAttribute("id", "audio");
                    self.audio.setAttribute("autoplay", true);

                    self.assets.appendChild(self.audio);

                    self.render_menu("audio");
                }
                else {
                    // directly add menu

                    // Render menu

                    self.render_menu();

                }

            }

            // Set scene

            self.main.urls.set_params({scene: self.main.state.state.actual_scene});

        }

     }

};