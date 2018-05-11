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

        self.camera = document.querySelector("a-camera");

        self.cursor = document.querySelector("a-cursor");

        // if(self.main.options.debug) {
        //     self.scene.setAttribute("stats", "");
        // }

    },

    // Renders auxiliary elements: lights, themes, floor, audio, etc..

    'render_aux_assets': function(){

        var self = this;

        // TODO: THEMES module

        self.ambient_light = document.createElement("a-entity");
        self.ambient_light.setAttribute("light", {type:"ambient", color: "#AAA"});
        self.ambient_light.classList.add("dataverse-added");

        self.directional_light = document.createElement("a-entity");
        self.directional_light.setAttribute("light", {type:"directional", color: "#EEE", intensity: 0.5});
        self.directional_light.setAttribute("position", {x:1, y:10, z:-1});
        self.directional_light.classList.add("dataverse-added");

        self.vive_controls = document.createElement("a-entity");

        self.vive_controls.setAttribute("vive-controls", {hand: "right"});
        self.vive_controls.setAttribute("teleport_controls", true);

        self.vive_controls.classList.add("dataverse-added");

        // Tweek cursor, fuse and raycaster

        self.cursor.setAttribute("color", self.theme_data.cursor_color);
        self.cursor.setAttribute("fuse-timeout", 1000);
        self.cursor.setAttribute("fuse", true);
        self.cursor.setAttribute("raycaster", {near: 0.0, objects: ".clickable"});

        // REMOVE COMMENTS
        // Insert intro panel

        self.intro_panel = document.createElement("a-entity");
        self.intro_panel.setAttribute("intro-panel", {
            theme: self.theme,
            credits: self.actual_scene_data.credits ? self.actual_scene_data.credits: "",
            title: self.actual_scene_data.title,
            text: self.actual_scene_data.explain,
            yaw: self.counter_cam_rotation
        });

        self.intro_panel.addEventListener("closed", function(){
            // Set sky opacity

            // Set floor opacity

            // Set component visibility

            self.actual_scene_component.setAttribute("visible", true);

            var floor_animation = document.createElement("a-animation");

            floor_animation.setAttribute("attribute", "opacity");
            floor_animation.setAttribute("dur", 1000);
            floor_animation.setAttribute("to", 1.0);

            self.floor.appendChild(floor_animation);

            var sky_animation = document.createElement("a-animation");

            sky_animation.setAttribute("attribute", "opacity");
            sky_animation.setAttribute("dur", 1000);
            sky_animation.setAttribute("to", 1.0);

            self.sky.appendChild(sky_animation);



        });

        self.intro_panel.classList.add("dataverse-added");


//
// color="yellow" raycaster="near: 0.0; objects: .clickable" fuse="true" fuse-timeout="1000"

        // self.camera = document.createElement("a-camera");
        //
        // self.cursor = document.createElement("a-cursor");
        // self.cursor.setAttribute("color", "yellow");
        // self.cursor.setAttribute("raycaster", {near: 0.0, objects: ".clickable"});
        // self.cursor.setAttribute("fuse", true);
        // self.cursor.setAttribute("fuse-timeout", 1000);
        //
        //
        // self.camera.appendChild(self.cursor);

        // self.scene.appendChild(self.camera);
        self.scene.appendChild(self.vive_controls);
        self.scene.appendChild(self.directional_light);
        self.scene.appendChild(self.ambient_light);
        self.scene.appendChild(self.intro_panel);


    },

    'render_menu': function(media_id){

        var self = this;

        // Add menu

        self.menu = document.createElement("a-entity");
        self.menu.classList.add("dataverse-added");

        var icons = self.main.state.state.scene_history.length === 0 ? {'icons': ["home.png"], 'names': ["home"]}: {'icons': ["arrow-left.png","home.png"], 'names': ["back","home"]};


        if(media_id!== null) {

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


            }

        });

    },

    'follow_link': function(destination){

        var self = this;

           // Push scene in history and change actual scene to destination

        self.main.state.state.scene_history.push(self.main.state.state.actual_scene);

         var obj = { Title: "", Url: window.location.origin + window.location.pathname + "?scene=" + self.main.state.state.actual_scene};
         history.pushState(obj, obj.Title, obj.Url);

        self.main.state.state.actual_scene = destination;

        self.render_scene();

    },

    // Renders a scene

    'render_scene': function(){

        var self = this;

        console.log("RENDERING SCENE");
        console.log(self.main.state.state.actual_scene, self.main.state);

        console.log("REMOVING SCENE ELEMENTS", self.scene);

        // Removing last scene children, if any

        console.log("CHILDREN", self.scene.children);

        console.log("CACHE", DATAVERSE.cache);

        // var cam_rotation = self.camera.el.getAttribute("rotation").y;

        console.log("LANDING WITH CAMERA ROTATION ", self.scene.camera.el.getAttribute("rotation").y);

        self.counter_cam_rotation = (self.scene.camera.el.getAttribute("rotation").y);

        // var to_delete = [];
        //
        // var candidates = document.getElementsByClassName("dataverse-added");
        //
        // for(var i=0; i < candidates.length; i++) {
        //
        //     to_delete.push(candidates[i]);
        // }
        //
        // to_delete.forEach(function(child){
        //     var parent = child.parentElement;
        //
        //     parent.removeChild(child);
        // });

        var to_delete = [];

        for(var i=0; i < self.scene.children.length; i++){

            var child = self.scene.children[i];

                if (!((child.hasAttribute("data-aframe-canvas")=== true)|| (child.hasAttribute("aframe-injected")=== true) || (child.hasAttribute("dataverse-added")))){
                    to_delete.push(child);
                }
        }

        to_delete.forEach(function(child){
            self.scene.removeChild(child);
        });

        self.assets = document.createElement("a-assets");
        self.assets.classList.add("dataverse-added");

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


            self.theme = (self.actual_scene_data.theme !== "") ? self.theme = self.actual_scene_data.theme : DATAVERSE.constants.default_theme;

            self.theme_data = DATAVERSE.themes[self.theme];

            // Redefine icon path

            UIPACK_CONSTANTS.icon_path = self.theme_data.icon_path;

            self.render_aux_assets();
            self.actual_scene_component = document.createElement("a-entity");
            self.actual_scene_component.classList.add("dataverse-added");
            self.actual_scene_component.setAttribute("visible", false);

            var my_params = AFRAME.utils.styleParser.parse(self.actual_scene_data.params);

            console.log("DECODED PARAMS ", my_params);

            my_params.title = self.actual_scene_data.title;
            my_params.explain = self.actual_scene_data.explain;
            my_params.source = self.main.state.state.scenes_data_source;
            my_params.tab = self.actual_scene_data.tab;

            // If theme exists, fill it in params

            my_params.theme = self.theme;

            if(self.actual_scene_data.media_source){

                my_params.media_source = self.actual_scene_data.media_source;
            }

            if(self.actual_scene_data.subtype){

                my_params.type = self.actual_scene_data.subtype;
            }


            console.log("LLAMANDO CON PARAMS", my_params, self.actual_scene_data);


            // console.log("LE ENCHUFO SOURCE", )

            // Set floor: its an image

            if(self.actual_scene_data.floor.indexOf('.')!==-1){

                self.floor_img = document.createElement("img");
                self.floor_img.classList.add("dataverse-added");
                self.floor_img.setAttribute("src", self.actual_scene_data.floor);
                self.floor_img.setAttribute("id", "floor_img");

                self.assets.appendChild(self.floor_img);

                self.floor = document.createElement("a-plane");
                self.floor.setAttribute("src", "#floor_img");
                self.floor.setAttribute("width", 100);
                self.floor.setAttribute("height", 100);
                self.floor.setAttribute("repeat", "100 100");

                self.floor.setAttribute("rotation", {x:-90, y: self.counter_cam_rotation, z:0});

                self.floor.classList.add("dataverse-added");

                self.floor.setAttribute("opacity", 0.0);

                self.scene.appendChild(self.floor);


            }
            else {

                if(self.actual_scene_data.floor) {

                    self.floor = document.createElement("a-plane");
                    self.floor.setAttribute("color", self.actual_scene_data.floor);
                    self.floor.setAttribute("width", 100);
                    self.floor.setAttribute("height", 100);
                    self.floor.setAttribute("repeat", "100 100");
                    self.floor.setAttribute("rotation", {x:-90, y: self.counter_cam_rotation, z:0});
                    self.floor.classList.add("dataverse-added");

                    self.floor.setAttribute("opacity", 0.0);

                    self.scene.appendChild(self.floor);

                }

                // If no specific floor, see if viz is on list of vizs with themed floor

                else {

                    console.log("BEFORE PUTTING FLOOR ", DATAVERSE.floor_vizs, self.actual_scene_data.type);

                    if(DATAVERSE.floor_vizs.indexOf(self.actual_scene_data.type.toLowerCase())!== -1){

                        var my_floor = self.theme_data.floor;

                        if(my_floor.indexOf(".") !== -1) {

                            console.log("PUTTING FLOOR IMG");

                            self.floor_img = document.createElement("img");
                            self.floor_img.classList.add("dataverse-added");
                            self.floor_img.setAttribute("src", my_floor);
                            self.floor_img.setAttribute("id", "floor_img");

                            self.assets.appendChild(self.floor_img);

                            self.floor = document.createElement("a-plane");
                            self.floor.setAttribute("src", "#floor_img");
                            self.floor.setAttribute("width", 100);
                            self.floor.setAttribute("height", 100);
                            self.floor.setAttribute("repeat", "100 100");

                            self.floor.setAttribute("rotation", {x: -90, y: self.counter_cam_rotation, z: 0});

                            self.floor.classList.add("dataverse-added");

                            self.floor.setAttribute("opacity", 0.0);

                            self.scene.appendChild(self.floor);
                        }
                        else {

                            console.log("PUTTING FLOOR FLAT");

                            self.floor = document.createElement("a-plane");
                            self.floor.setAttribute("color", my_floor);
                            self.floor.setAttribute("width", 100);
                            self.floor.setAttribute("height", 100);
                            self.floor.setAttribute("repeat", "100 100");
                            self.floor.setAttribute("rotation", {x: -90, y: self.counter_cam_rotation, z: 0});
                            self.floor.classList.add("dataverse-added");

                            self.floor.setAttribute("opacity", 0.0);

                            self.scene.appendChild(self.floor);
                        }


                    }

                }
            }


           // Set sky

           // color ?

            // Assume an image if background contains a dot

            if(self.actual_scene_data.background.indexOf('.')!==-1){

                self.sky_img = document.createElement("img");
                self.sky_img.classList.add("dataverse-added");
                self.sky_img.setAttribute("src", self.actual_scene_data.background);
                self.sky_img.setAttribute("id", "sky_img");

                self.assets.appendChild(self.sky_img);

                self.sky = document.createElement("a-sky");
                self.sky.setAttribute("src", "#sky_img");
                self.sky.classList.add("dataverse-added");

                self.sky.setAttribute("opacity", 0.0);


                self.sky.setAttribute("rotation", {x:0, y: self.counter_cam_rotation, z:0});


                self.scene.appendChild(self.sky);


            }
            else {

                if(self.actual_scene_data.background) {

                    self.sky = document.createElement("a-sky");
                    self.sky.setAttribute("color", self.actual_scene_data.background);
                    self.sky.classList.add("dataverse-added");

                    self.sky.setAttribute("rotation", {x:0, y: self.counter_cam_rotation, z:0});

                    self.sky.setAttribute("opacity", 0.0);

                    self.scene.appendChild(self.sky);
                }
                else {

                    if(DATAVERSE.sky_vizs.indexOf(self.actual_scene_data.type.toLowerCase())!== -1){

                        var my_sky = self.theme_data.sky;

                        if(my_sky.indexOf(".") !== -1) {

                            self.sky_img = document.createElement("img");
                            self.sky_img.classList.add("dataverse-added");
                            self.sky_img.setAttribute("src", my_sky);
                            self.sky_img.setAttribute("id", "sky_img");

                            self.assets.appendChild(self.sky_img);

                            self.sky = document.createElement("a-sky");
                            self.sky.setAttribute("src", "#sky_img");
                            self.sky.classList.add("dataverse-added");

                            self.sky.setAttribute("rotation", {x:0, y: self.counter_cam_rotation, z:0});

                            self.sky.setAttribute("opacity", 0.0);


                            self.scene.appendChild(self.sky);

                        }
                        else {

                            self.sky = document.createElement("a-sky");
                            self.sky.setAttribute("color", my_sky);
                            self.sky.classList.add("dataverse-added");

                            self.sky.setAttribute("rotation", {x:0, y: self.counter_cam_rotation, z:0});

                            self.sky.setAttribute("opacity", 0.0);


                            self.scene.appendChild(self.sky);


                        }

                    }
                }
            }

            console.log("my params", my_params);


            // Set position and rotation from params, and delete from entity-specific params

            if("position" in my_params){
                self.actual_scene_component.setAttribute("position", my_params.position);
                delete(my_params.position);
            }

            // if("rotation" in my_params){
            //     self.actual_scene_component.setAttribute("rotation", my_params.rotation);
            //     delete(my_params.rotation);
            // }


            // Set rotation if specified and/or correct for user head yaw landing (based on camera)

            if("rotation" in my_params){
                self.actual_scene_component.setAttribute("rotation", {x: my_params.rotation.split(" ")[0], y:(parseFloat(my_params.rotation.split(" ")[1]) + self.counter_cam_rotation) % 360, z: my_params.rotation.split(" ")[2]}) ;
                delete(my_params.rotation);
            }
            else {
                self.actual_scene_component.setAttribute("rotation", {x: 0, y: (self.counter_cam_rotation % 360), z: 0}) ;
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

                // Only launch audio if exists and it's not a video-viz

                if((self.actual_scene_data.audio.length > 2) && !(self.actual_scene_data.type === "video-viz")) {

                    self.audio = document.createElement("audio");
                    self.audio.classList.add("dataverse-added");

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

            // React on 'link'

            self.actual_scene_component.addEventListener("link", function(evt){
                console.log("LINK PRESSED: ", evt.detail.link);

                self.follow_link(evt.detail.link);
            });

            self.actual_scene_component.addEventListener("dv_loaded", function(evt){

                console.log("EL COMPONENTE HA ACABADO DE CARGARSE ", self.intro_panel.components);

                self.intro_panel.emit("closed", null, false);

                self.intro_panel.components['intro-panel'].loaded();

            });
        }

     }

};