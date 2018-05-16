AFRAME.registerComponent('photo-viz', {

    // Some standard properties right here...

    schema: {
        media_source: {type: 'string', default: ""},
        source: {type: 'string', default: ""},
        tab: {type: 'string', default: ""},
        theme: {'type': 'string', default: ""},
        title_scale: {type: 'float', default: 1.5},
        explain_scale: {type: 'float', default: 1.0},
        title: {type: 'string', default: ""},
        explain: {type: 'string', default: ""},
        label_distance: {type: 'number', default: 10},
        label_dmms: {type: 'int', default: 20},
        label_height: {type: 'number', default: 1.6},
        label_background: {type: 'string', default: "black"},
        label_color: {type: 'string', default: "white"},
        label_font: {type: 'string', default: "roboto"},
        general_button_dmms : {type: 'int', default: 20},
        debug: {type: 'boolean', default: false}
    },

    init: function () {

        var self = this;

        console.log("INIT COMPONENT", self);

        // Create a sky if there is none present

        if(document.getElementsByTagName("a-sky").length == 0){

            document.getElementsByTagName("a-scene")[0].appendChild(document.createElement("a-sky"));

        }

        // Match component rotation to sky...

        document.getElementsByTagName("a-sky")[0].setAttribute("rotation", {x:0, y: self.el.getAttribute("rotation").y, z:0});

    },

    // Adds a 'more' button if applicable

    add_more_button: function(parent, info, sequence, label_height){

        var self = this;

        if((info.headline !== "") && (info.text !== "")) {

            var more_button = document.createElement("a-entity");

            var icon_radius = (self.data.general_button_dmms * self.data.label_distance) / 1000;

            more_button.setAttribute("uipack-button", {
                theme: self.data.theme,
                icon_name: 'plus.png',
                radius: (self.data.general_button_dmms * self.data.label_distance) / 1000
            });

            more_button.setAttribute("position", {x: 0, y: label_height, z: 0});

            parent.appendChild(more_button);

            more_button.addEventListener("click", function () {

                // Retore trigger as clickable (just in case it is cross-launched)


                if (self.el.sceneEl.restore_clickable) {
                    self.el.sceneEl.restore_clickable.classList.add("clickable");
                }


                // cam yaw rotation

                var yaw = (self.el.sceneEl.camera.el.getAttribute("rotation").y) % 360;
                var pitch = (self.el.sceneEl.camera.el.getAttribute("rotation").x) % 360;

                if (self.el.sceneEl.media_panel) {
                    if (self.el.sceneEl.media_panel.parentNode) {
                        self.el.sceneEl.media_panel.parentNode.removeChild(self.el.sceneEl.media_panel);
                    }
                }

                // insert a media_panel with datum, distance and yaw

                self.media_panel = document.createElement("a-entity");

                var cam_position = self.el.sceneEl.camera.el.getAttribute("position");

                self.media_panel.setAttribute("position", {
                    x: cam_position.x,
                    y: cam_position.y,
                    z: cam_position.z
                });


                self.media_panel.setAttribute("uipack-mediapanel", {
                    yaw: yaw,
                    pitch: pitch,
                    theme: self.data.theme,
                    distance: 1.5,
                    title: info.headline,
                    subtitle: "",
                    text: info.text,
                    media_url: info.media,
                    media_caption: info.media_caption,
                    media_credit: info.media_credit,
                    link: info.link,
                    link_thumbnail: DATAVERSE_VIZ_AUX.get_scene_thumbnail(info.link, self.scene_data),
                    link_type: DATAVERSE_VIZ_AUX.get_scene_type(info.link, self.scene_data),
                    id: "photo-viz" + sequence
                });

                self.media_panel.addEventListener("link", function (data) {
                    self.el.emit("link", {link: data.detail.link}, false);
                    console.log("LINKANDO A ", data.detail.link);
                });


                self.el.sceneEl.appendChild(self.media_panel);

                self.el.sceneEl.media_panel = self.media_panel;

                self.el.sceneEl.restore_clickable = this;

                self.el.sceneEl.restore_clickable.classList.remove("clickable");

            });

        }
    },


    // Render contents of tab

    render_tab: function(){

        var self = this;

        console.log("RENDERING TAB", self.prepared_data);

        self.prepared_data.forEach(function(datum, i){

                    var object = document.createElement("a-entity");

                    // TODO: CHANGE label_height to that of camera...

                    var arc = datum.yaw * THREE.Math.DEG2RAD;

                    console.log("ARC", arc);

                    object.setAttribute('position', {x: self.data.label_distance * Math.sin(arc), y: self.data.label_height, z: self.data.label_distance * Math.cos(arc)});

                    // Face the center

                    object.setAttribute('rotation', {x: 0, y: (arc / Math.PI) * 180 > 180 ? (arc / Math.PI) * 180 - 180 : 180 + (arc / Math.PI) * 180, z: 0});

                    var title = datum.headline;

                    var text_width = (self.data.label_dmms * self.data.label_distance * (title.length + 4)) / 1000;

                    object.setAttribute('text', {value: title, align: "center",
                                                color: self.data.theme ? DATAVERSE.themes[self.data.theme].text_color : self.data.label_color,
                                                font: self.data.theme ? DATAVERSE.themes[self.data.theme].text_font : self.data.label_font,
                                                width: text_width,
                                                wrapCount: title.length + 4, zOffset: 0.01});

                    var label_height = (self.data.label_dmms * self.data.label_distance / 1000)*3;

                    object.setAttribute("geometry", {primitive: "plane", height: label_height, width: "auto"});

                    object.setAttribute("material", {color: self.data.theme ? DATAVERSE.themes[self.data.theme].text_background : self.data.label_background, shader: "flat"});


                    // self.add_more_button(object, datum, sequence);

                    self.add_more_button(object, datum, i, label_height);

                    self.el.appendChild(object);

        });



    },

    // Create or update geometry

    update: function (oldData) {

        var self = this;

        console.log("UPDATING COMPONENT", self);

        // Iterate through objects and titles and delete them

        console.log("DELETING OLD GEOMETRY ...");

        // Regenerating new geometry

        console.log("REGENERATING NEW GEOMETRY ...");

        // Whatever needs to do to render...

        // Set sky src to data.source

        // Streetview...

        var sv_re = /\s*-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?\s*/i;

        // console.log("REGEXP",self.data.media_source.search(sv_re));

        if (self.data.media_source.search(sv_re) !== -1) {

            console.log("PHOTO TYPE: GSV");

            var params =  self.data.media_source.trim().split(",");

            var lat = parseFloat(params[0].trim());

            var lon = parseFloat(params[1].trim());

            console.log("LATLONG", lat, lon);

            // Create a PanoLoader object

            var loader = new GSVPANO.PanoLoader();

            loader.setZoom(DATAVERSE_VIZ_AUX.gsv_quality);

            loader.onPanoramaLoad = function() {

                console.log("ON PANORAMA LOAD");

                console.log(this.canvas);

                var texture = new THREE.Texture(this.canvas);

                var sky = document.getElementsByTagName("a-sky")[0];



                if(sky.object3D.children[0].material.map === null) {
                    sky.object3D.children[0].material = new THREE.MeshBasicMaterial();
                    sky.object3D.children[0].material.map = texture;
//                    sky.object3D.children[0].material.opacity = 0.0;

                    console.log("SKYSKY", sky.object3D.children[0].material);
                }

                texture.needsUpdate = true;


                self.el.emit("dv_loaded", null, false);

            };

            loader.load(new google.maps.LatLng(lat,lon));




        }
        // Photosphere
        else {

            console.log("PHOTO TYPE: Photosphere");

            document.getElementsByTagName("a-sky")[0].setAttribute("src", self.data.media_source);
//            document.getElementsByTagName("a-sky")[0].setAttribute("opacity", self.data.debug ? 1.0 : 0.0);


            document.getElementsByTagName("a-sky")[0].removeAttribute("color");

            document.getElementsByTagName("a-sky")[0].addEventListener("materialtextureloaded", function(){

                console.log("SKY CARGADO");

                self.el.emit("dv_loaded", null, false);

            });
        }

        if((self.data.tab) && (self.data.source)){

            DATAVERSE_VIZ_AUX.load_data("photo-viz", self.data.source, self.data.tab, function(my_data, scene_data) {

                if(my_data!==null) {

                    self.prepared_data = my_data;

                    self.scene_data = scene_data;

                    console.log("LOADED TAB ", self.prepared_data, self.scene_data);

                    self.render_tab();
                }

            });

        }

    },

    remove: function () {

    }
});
