AFRAME.registerComponent('video-viz', {

    // Some standard properties right here...

    schema: {
        media_source: {type: 'string', default: ""},
        source: {type: 'string', default: ""},
        theme: {'type': 'string', default: ""},
        type: {type: 'string', default: "360"},
        title_scale: {type: 'float', default: 1.5},
        explain_scale: {type: 'float', default: 1.0},
        title: {type: 'string', default: ""},
        explain: {type: 'string', default: ""},
        label_distance: {type: 'number', default: 10},
        label_dmms: {type: 'int', default: 20},
        label_height: {type: 'number', default: 1.6},
        label_background: {type: 'string', default: "black"},
        label_color: {type: 'string', default: "white"},
        general_button_dmms : {type: 'int', default: 20},
        label_font: {type: 'string', default: "roboto"}
    },

    init: function () {

        var self = this;

        console.log("INIT COMPONENT", self);

        // Create a sky if there is none present

        if(document.getElementsByTagName("a-sky").length == 0){

            document.getElementsByTagName("a-scene")[0].appendChild(document.createElement("a-sky"));

        }

        // Default types

        self.video_type = {'coverage': "full", 'stereo': false, 'split': 'horizontal'};

        // Get types from type

        if (self.data.type.includes('180')) self.video_type.coverage = "half";

        if (self.data.type.includes('stereo')) self.video_type.stereo = true;

        if (self.data.type.includes('vertical')) self.video_type.split = 'vertical';

        console.log("EL TIPO QUEDA", self.video_type);

        // Set camera to stereo left eye stereocam="eye:left;"

        if(document.getElementsByTagName("a-camera")[0] !== null){

            // TODO: Should have been document.getElementsByTagName("a-scene")[0].camera
            // https://aframe.io/docs/0.7.0/core/scene.html
            // But does not work... is this because camera is not attached already and should wait to component mount
            // of a-scene?

            document.getElementsByTagName("a-camera")[0].setAttribute("stereocam", "eye:left");

        }

    },

      // Adds a 'more' button if applicable

    add_more_button: function(parent, info, sequence, label_height){

        var self = this;

        if((info.headline !== "") && (info.text !== "")) {

            var more_button = document.createElement("a-entity");

            var icon_radius = (self.data.general_button_dmms * self.data.label_distance) / 1000;

            more_button.setAttribute("uipack-button", {
                'theme': self.data.theme,
                icon_name: 'plus.png',
                radius: (self.data.general_button_dmms * self.data.label_distance) / 1000
            });

            more_button.setAttribute("position", {x: 0, y: label_height, z: 0});

            parent.appendChild(more_button);

            more_button.addEventListener("click", function () {


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
                    id: "video-viz" + sequence
                });

                self.media_panel.addEventListener("link", function (data) {
                    self.el.emit("link", {link: data.detail.link}, false);
                    console.log("LINKANDO A ", data.detail.link);
                });


                self.el.sceneEl.appendChild(self.media_panel);

                self.el.sceneEl.media_panel = self.media_panel;


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

//        document.getElementsByTagName("a-sky")[0].setAttribute("src", self.data.source);
//
//        document.getElementsByTagName("a-sky")[0].removeAttribute("color");

            // If stereo video

            if (self.video_type.stereo) {

                console.log("DIBUJANDO ESTEREO");

                var video_id = "stereo_video" + "_" + Math.floor((Math.random() * 1000000000) + 1);

                var scene = document.getElementsByTagName("a-scene")[0];
                var assets = document.getElementsByTagName("a-assets")[0];

                self.video = document.createElement("video");

                self.video.setAttribute("src", self.data.media_source);
                self.video.setAttribute("id", video_id);
                self.video.setAttribute("loop", false);

//                self.video.addEventListener("canplay", function(){
//
//                    console.log("El video se puede playear");
//
//                });

                assets.appendChild(self.video);

                // Emit event for attaching to a menu or player from the outside

                self.el.emit("asset_added", {'id': video_id}, false);

                self.stereo_left_sphere = document.createElement("a-entity");

                self.stereo_left_sphere.setAttribute("class", "videospheres");

                self.stereo_left_sphere.setAttribute("geometry", "primitive:sphere; radius:100; segmentsWidth: 64; segmentsHeight:64");
                self.stereo_left_sphere.setAttribute("material", "shader: flat; src: #" + video_id);
                self.stereo_left_sphere.setAttribute("scale", "-1 1 1");

                AFRAME.utils.entity.setComponentProperty(self.stereo_left_sphere, "stereo", {'eye': 'left', 'mode': self.video_type.mode, 'split': self.video_type.split});

                self.el.sceneEl.appendChild(self.stereo_left_sphere);

                self.stereo_right_sphere = document.createElement("a-entity");

                self.stereo_right_sphere.setAttribute("class", "videospheres");

                self.stereo_right_sphere.setAttribute("geometry", "primitive:sphere; radius:100; segmentsWidth: 64; segmentsHeight:64");
                self.stereo_right_sphere.setAttribute("material", "shader: flat; src: #" + video_id);
                self.stereo_right_sphere.setAttribute("scale", "-1 1 1");

                self.stereo_right_sphere.addEventListener("materialvideoloadeddata", function(){

                    self.el.emit("dv_loaded", null, false);

                });


                AFRAME.utils.entity.setComponentProperty(self.stereo_right_sphere, "stereo", {'eye': 'right', 'mode': self.video_type.mode, 'split': self.video_type.split});

                self.video.play();

                self.el.sceneEl.appendChild(self.stereo_right_sphere);


            }
            else {
                console.log("DIBUJANDO MONO");

                var video_id = "mono_video" + "_" + Math.floor((Math.random() * 1000000000) + 1);

                var scene = document.getElementsByTagName("a-scene")[0];
                var assets = document.getElementsByTagName("a-assets")[0];

                self.video = document.createElement("video");

                self.video.setAttribute("src", self.data.media_source);
                self.video.setAttribute("id", video_id);
                self.video.setAttribute("loop", false);

//                self.video.addEventListener("canplay", function(){
//
//                    console.log("El video se puede playear");
//
//                });

                assets.appendChild(self.video);

                self.el.emit("asset_added", {'id': video_id}, false);

                self.mono_sphere = document.createElement("a-entity");

                self.mono_sphere.setAttribute("class", "videospheres");

                self.mono_sphere.setAttribute("geometry", "primitive:sphere; radius:100; segmentsWidth: 64; segmentsHeight:64");
                self.mono_sphere.setAttribute("material", "shader: flat; src: #" + video_id);
                self.mono_sphere.setAttribute("scale", "-1 1 1");

                self.mono_sphere.addEventListener("materialvideoloadeddata", function(){

                    self.el.emit("dv_loaded", null, false);

                });


                // Video should be played if not using stereo component

                self.video.play();

                self.el.sceneEl.appendChild(self.mono_sphere);

            }


        // Labels...

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
