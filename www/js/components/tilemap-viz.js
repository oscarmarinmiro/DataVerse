/**
 * Created by Oscar on 11/03/17.
 */

AFRAME.registerComponent("info-panel", {
    schema: {
        jsonData:{
            parse: JSON.parse,
            stringify: JSON.stringify
        },
        position: {type: "vec3", default: {x:0, y:0, z:0}

        }
    }
});

AFRAME.registerComponent("dimmify", {

    schema:{

    },

    init: function(){

    },
    update: function(){

    },
    tick: function(){
        var self = this;

        // Get distance to camera ...

//        var cam_position = self.el.sceneEl.camera.el.getAttribute("position");
//        var el_position = self.el.getAttribute("position");
//
//        var distance = new THREE.Vector3(cam_position.x, cam_position.y, cam_position.z).distanceTo(new THREE.Vector3(el_position.x, el_position.y, el_position.z));


        var distance = DATAVERSE_VIZ_AUX.get_distance(self.el.sceneEl.camera.el, self.el);

        // And adjust scale

        self.el.setAttribute("scale", {x: 0.001*distance, y: 0.001*distance, z: 0.001*distance});


    }

});

AFRAME.registerComponent("face-camera",{

    // Some standard properties right here...

    schema: {
    },

    init: function () {
        var self = this;
        self.vector = new THREE.Vector3();

        console.log(self.el.sceneEl.camera);

    },
    update: function(oldData){
        var self = this;
    },
    tick: function(oldData) {
        var self = this;

        self.cameraObject = self.el.sceneEl.camera;

//      OLD METHOD
//      var cam_position = self.cameraObject.el.getAttribute("position");


        var cam_position = new THREE.Vector3();

        cam_position.setFromMatrixPosition(self.cameraObject.matrixWorld);


        var worldPos = new THREE.Vector3();
        worldPos.setFromMatrixPosition(self.el.object3D.matrixWorld);

        var diff_y = cam_position.clone().sub(worldPos).setY(0).normalize();

        var diff_x = cam_position.clone().sub(worldPos).setX(0).normalize();

        var diff = cam_position.clone().sub(worldPos).normalize();


        var el_rotation = self.el.getAttribute("rotation");

        el_rotation.y = Math.atan2(diff_y.x, diff_y.z) * 180 / Math.PI;
//        el_rotation.x = -45;
//        el_rotation.x = (Math.atan2(-diff_x.y, diff_x.z)* 180 / Math.PI);
//
//        if(el_rotation.x < -90){
//            el_rotation.y+=180;
//            el_rotation.z+=180;
//        }
//
//        console.log(el_rotation);

        self.el.setAttribute("rotation", el_rotation);


//        self.el.setAttribute("ro")

//        OLD METHOD


//        self.el.object3D.lookAt(self.vector.set(cam_position.x, cam_position.y, cam_position.z));
//        self.el.object3D.lookAt(self.vector.set(cam_position.x, cam_position.y, cam_position.z));

//        self.el.object3D.lookAt(self.cameraObject.el.object3D.position);

//        self.el.object3D.lookAt(self.vector.set(0.0,0.0,0));

//        self.el.object3D.lookAt(self.vector.set(cam_position.x,1.0,cam_position.z));

//        console.log(self.cameraObject.getAttribute("position"));
//
//        console.log("CAMERA OBJECT", self.cameraObject.matrixWorld);
    }

});

AFRAME.registerSystem('tilemap-viz', {

    schema: {},

    init: function(){

        var self = this;


    },

    load_data: function(viz_name, path, tab, callback){

        DATAVERSE_VIZ_AUX.load_data(viz_name, path, tab, callback);

    },

    parse_data: function(data, component_data) {

        var self = this;

        console.log("SYSTEM PREPARING DATA", path);

        // Do whatever transformations need to be done

        return data;

    }

});


AFRAME.registerComponent('tilemap-viz', {

    // Some standard properties right here...

    schema: {
        source: {type: 'string', default: ""},
        tab: {type: 'string', default: ""},
        theme: {'type': 'string', default: ""},
        provider: {type: 'string', default: "CartoDB.Positron"},
        lat: {type: 'float', default: 51.4825757},
        long: {type: 'float', default: -0.0164351},
        zoom: {type: 'number', default: 18},
        size: {type: 'number', default: 10},
        canvas_size: {type: 'number', default: 2048},
        marker_size: {type: 'number', default: 0.25},
        text_color: {type: 'string', default: "white"},
        text_font: {type: 'string', default: "roboto"},
        text_background: {type: 'string', default: "black"},
        map_y: {type: 'float', default: 0.0}
    },

    init: function () {

        var self = this;

        console.log("INIT COMPONENT", self);

        // Undo rotation from renderer :) TODO: It's super problematic here, how to ammend instead of removing it???

        self.el.setAttribute("rotation", {x:0, y:0, z:0});


        // Load data and 'prepare' it for rendering

        if (self.data.source !== "") {

            this.system.load_data("tilemap", self.data.source, self.data.tab, function (data, scene_data) {

                if(data!==null) {

                    self.prepared_data = data;

                    self.scene_data = scene_data;

                    // insert leaflet div

                    self.map_div = document.createElement("div");

                    self.map_div.setAttribute("id", "map");

                    self.map_div.style.height = self.data.canvas_size + "px";
                    self.map_div.style.width = self.data.canvas_size + "px";


//                    self.map_div.style.display = "none";
//                    self.map_div.style.opacity = 0;
//                    self.map_div.style.visibility = "hidden";
                    self.map_div.style['z-index'] = -9999;
//                    self.map_div.style.position = "static!important";

                    var body = document.querySelector("body");

                    body.appendChild(self.map_div);

//                    self.el.appendChild(self.map_div);


                    console.log("LATLONG", self.data.lat, self.data.long, self.data.zoom);

                    self.map = L.map('map').setView([self.data.lat, self.data.long], self.data.zoom);
                    self.layer = L.tileLayer.provider(self.data.theme ? DATAVERSE.themes[self.data.theme].map_provider : self.data.provider);

                    self.layer.addTo(self.map);

                    console.log("LLLL",self.map.getPanes("tilePane").tilePane);

//                    https://stackoverflow.com/questions/28873713/leaflet-event-on-tiles-loading?rq=1

                        self.layer.on("load", function() {

                            html2canvas(document.getElementById("map"), {
                                useCORS: true,
                                onrendered: function (canvas) {

                                    self.el.appendChild(canvas);

                                    console.log("RENDERED");

                                    self.map_img = document.createElement('img');
                                    self.map_img.setAttribute("id", "map_img");
                                    var dimensions = self.map.getSize();
                                    self.map_img.width = dimensions.x;
                                    self.map_img.height = dimensions.y;
                                    self.map_img.src = canvas.toDataURL();

                                    var assets = document.querySelector("a-assets");

                                    assets.appendChild(self.map_img);

                                    self.update();


                                    //                            document.getElementById('images').innerHTML = '';
                                    //                            document.getElementById('images').appendChild(img);

                                }
                            });
                        });


//                            leafletImage(self.map, function(err, canvas) {
//
//
//                                    var map_img = document.createElement('img');
//                                    map_img.setAttribute("id", "map_img");
//                                    var dimensions = self.map.getSize();
//                                    map_img.width = dimensions.x;
//                                    map_img.height = dimensions.y;
//                                    map_img.src = canvas.toDataURL();
//
//                                    var assets = document.querySelector("a-assets");
//
//                                    assets.appendChild(map_img);
//
//                                    self.map_img = map_img;
//
//                                    self.update();
//                            });
//

//                    var interval_function = function() {
//
//
//                        html2canvas(document.getElementById("map"), {
//                            useCORS: true,
//                            onrendered: function (canvas) {
//
//                                if(self.map_img){
//                                    self.map_img.parentNode.removeChild(self.map_img);
//                                    self.map_canvas.parentNode.removeChild(self.map_canvas);
//                                }
//
//                                self.el.appendChild(canvas);
//
//                                console.log("RENDERED");
//
//                                self.map_img = document.createElement('img');
//                                self.map_img.setAttribute("id", "map_img");
//                                var dimensions = self.map.getSize();
//                                self.map_img.width = dimensions.x;
//                                self.map_img.height = dimensions.y;
//                                self.map_img.src = canvas.toDataURL();
//
//                                var assets = document.querySelector("a-assets");
//
//                                assets.appendChild(self.map_img);
//
//                                self.map_canvas = canvas;
//
//                                self.update();
//
//
////                            document.getElementById('images').innerHTML = '';
////                            document.getElementById('images').appendChild(img);
//
//                            }
//                        });
//                    };
//
//                    setInterval(interval_function, 3000);



                }
                else {
                    console.error("Could not load data file ", self.data.source);
                }
            });
        }

    },

    // Insert a marker given datum and coords

    insert_marker: function(datum, position, number){

        var self = this;

        // Insert datum in entity var space

        console.log("MARKER DE DATUM", datum, position);
        // MOCKUP: sphere

        var marker = document.createElement("a-entity");

        marker.__data__ = datum;

        console.log("MARKER DATA", marker.__data__);

        marker.setAttribute("shadow", {cast:true});

        marker.setAttribute("position", position);

        var element_color;

        if(datum.color.length > 1) {

            element_color = datum.color;

        }
        else {

            element_color = DATAVERSE_VIZ_AUX.get_default_color_from_theme(self.data.theme);

        }

        var marker_jump = (self.data.marker_size / 4);


        var sphere = document.createElement("a-sphere");

        sphere.setAttribute("position", {x:0, y: -marker_jump, z:0});

        sphere.setAttribute("color", element_color);
        sphere.setAttribute("radius", marker_jump);

        var cone = document.createElement("a-cone");

        cone.setAttribute("height", marker_jump*3);
        cone.setAttribute("color", element_color);
        cone.setAttribute("position", {x:0, y: -(marker_jump) * 2.5, z:0});
        cone.setAttribute("radius-top", marker_jump);
        cone.setAttribute("radius-bottom", 0);


        var icon_radius = ((DATAVERSE.dmms.plus_button/2) * (self.data.size/2)) / 1000;


//        cone.setAttribute("shadow", {cast: true});

        var text = document.createElement("a-entity");


        var text_width = (DATAVERSE.dmms.map_label * (self.data.size/2) * (datum.headline.length + 2)) / 1000;

//        .setAttribute('text', {value: title, align: "center", color: self.data.text_color, width: text_width, wrapCount: title.length + 4, zOffset: 0.01});


        text.setAttribute("text", {value: datum.headline, align: "center",
            color: self.data.theme ? DATAVERSE.themes[self.data.theme].text_color : self.data.label_color,
            font: self.data.theme ? DATAVERSE.themes[self.data.theme].text_font : self.data.label_font,
            width: text_width, wrapCount: datum.headline.length + 4, zOffset: 0.01});


        var label_height = (DATAVERSE.dmms.map_label * (self.data.size/2) / 1000)*3;

        text.setAttribute("geometry", {primitive: "plane", height: label_height, width: "auto"});

        text.setAttribute("material", {color: self.data.theme ? DATAVERSE.themes[self.data.theme].text_background : self.data.text_background, shader: "flat", opacity: 0.2, transparent: true});

//        text.setAttribute("material", {color: self.data.theme ? DATAVERSE.themes[self.data.theme].text_background : self.data.text_background, shader: "flat", opacity: 0.2, transparent: true});

        text.setAttribute("position", {x:0, y: (self.data.marker_size / 2) + (text_width / 2) + icon_radius*2, z:0});
        text.setAttribute("rotation", {x:0, y: 0, z:90});

//        text.setAttribute("scale", {x:2.0, y:2.0, z:2.0});
        text.setAttribute("face-camera", "");


//                    object.setAttribute('text', {value: title, align: "center", color: self.data.text_color, width: text_width, wrapCount: title.length + 4, zOffset: 0.01});
//
//                    object.setAttribute("geometry", {primitive: "plane", height: "auto", width: "auto"});
//
//                    object.setAttribute("material", {color: self.data.text_background, shader: "flat"});


        var button_row = document.createElement("a-entity");

        button_row.setAttribute("position", {x:0, y: 0, z:0});

        button_row.setAttribute("face-camera", "");

        button_row.setAttribute("rotation", {x:0, y: 0, z:0});


        var more = document.createElement("a-entity");

//        more.setAttribute("uipack-button", {'icon_name': 'plus.png', 'radius': 25});
//        more.setAttribute("dimmify", "");

        more.setAttribute("uipack-button", {'theme': self.data.theme, 'icon_name': 'plus.png', 'radius': icon_radius});


//        more.setAttribute("position", {x: -icon_radius*2, y:  self.data.marker_size/4 + (label_height*1.5), z:0});
        more.setAttribute("position", {x: 0, y:  icon_radius*1.5, z:0});


        more.addEventListener("clicked", function(){

            // Retore trigger as clickable (just in case it is cross-launched)


            if (self.el.sceneEl.restore_clickable) {
                self.el.sceneEl.restore_clickable.classList.add("clickable");
            }

            console.log("CLICK ON THIS", this);

            // distance between camera and this

            var distance = DATAVERSE_VIZ_AUX.get_distance_xz(self.el.sceneEl.camera.el, this);

            // cam yaw rotation

            var yaw = (self.el.sceneEl.camera.el.getAttribute("rotation").y) % 360;
            var pitch = (self.el.sceneEl.camera.el.getAttribute("rotation").x) % 360;

            console.log("DISTANCE", distance, yaw, more.parentNode.parentNode.__data__);

            if(self.media_panel){
                console.log("MEDIA PANEL", self.media_panel);

                // TODO: SE QUEDA SIN PADRE MEDIA PANEL ON CLOSE, PERO NO DESAPARECE!!

                if(self.media_panel.parentNode) {
                    self.media_panel.parentNode.removeChild(self.media_panel);
                }
            }

            // insert a media_panel with datum, distance and yaw

            self.media_panel = document.createElement("a-entity");

            // Have to take into account element position b/c we change it when clicking on 'arrows' to get near markers (instead of moving
            // the camera b/c of Vive problems with updating camera position

            self.media_panel_position = {

                x: self.el.sceneEl.camera.el.getAttribute("position").x - self.el.getAttribute("position").x,
                y: self.el.sceneEl.camera.el.getAttribute("position").y - self.el.getAttribute("position").y,
                z: self.el.sceneEl.camera.el.getAttribute("position").z - self.el.getAttribute("position").z

            };

            self.media_panel.setAttribute("position", self.media_panel_position);


            self.media_panel.setAttribute("shadow", {cast:true});

            self.media_panel.classList.add("dataverse-added");

            self.media_panel.setAttribute("uipack-mediapanel", {
                yaw: yaw,
                pitch: 0,
                theme: self.data.theme,
                distance: 1.5,
                title: datum.headline,
                text: datum.text,
                low_height: 1,
                media_url: datum.media,
                media_caption: datum['media_caption'],
                media_credit: datum['media_credit'],
                link: datum.link,
                link_thumbnail: DATAVERSE_VIZ_AUX.get_scene_thumbnail(datum.link, self.scene_data),
                link_type: DATAVERSE_VIZ_AUX.get_scene_type(datum.link, self.scene_data),
                id: "marker_" + number
            });

            self.media_panel.addEventListener("link", function(data){
                self.el.emit("link", {link: data.detail.link}, false);
                console.log("LINKANDO A ", data.detail.link);
            });

            self.el.appendChild(self.media_panel);


            self.el.sceneEl.restore_clickable = this;

            self.el.sceneEl.restore_clickable.classList.remove("clickable");


        });

//        more.setAttribute("rotation", {x:-45, y: 0, z:0});

//        more.setAttribute("face-camera", "");


//        var media = document.createElement("a-entity");
//
////        more.setAttribute("uipack-button", {'icon_name': 'street-view.png', 'radius': 25});
////        more.setAttribute("dimmify", "");
//
//        media.setAttribute("uipack-button", {'icon_name': 'street-view.png'});
//
//
//        media.setAttribute("position", {x:-0.3, y: self.data.marker_size*0.75, z:0});
//        media.setAttribute("rotation", {x:-45, y: 0, z:0});

//        media.setAttribute("face-camera", "");


        var link = document.createElement("a-entity");
        link.setAttribute("uipack-button", {'theme': self.data.theme, 'icon_name': 'arrow-up.png', 'radius': icon_radius});
//        link.setAttribute("position", {x: icon_radius*2, y: self.data.marker_size/4 + (label_height*1.5), z:0});

        link.setAttribute("position", {x: 0, y: icon_radius*4.0, z:0});

        link.addEventListener("clicked", function(){

            var cam_position = self.el.sceneEl.camera.el.getAttribute("position");

            console.log("NEW POSITION 1", cam_position.x, cam_position.y, cam_position.z);

//            console.log("CAM POSITION", self.el.sceneEl.camera.el.getAttribute("position"));

            var new_position = DATAVERSE_VIZ_AUX.cam_destination_to_object(self.el.sceneEl.camera.el, marker, 0.5);

            var differences = {x: new_position.x - cam_position.x, y: new_position.y - cam_position.y, z: new_position.z - cam_position.z};

            // Move element instead of moving camera....

            var component_position = self.el.getAttribute("position");

            self.el.setAttribute("position", {x: component_position.x - differences.x, y: component_position.y - differences.y, z: component_position.z - differences.z});

//            console.log("NEW POSITION 2", new_position.x, new_position.y, new_position.z);
//
//            self.el.sceneEl.camera.el.setAttribute("position", new_position);
//
//            var final_position = self.el.sceneEl.camera.el.getAttribute("position");
//
////            self.el.sceneEl.camera.el.object3D.worldToLocal(new_position);
//
//
////            self.el.sceneEl.camera.el.object3D.matrixWorldNeedsUpdate = true;
////
////            self.el.sceneEl.camera.el.object3D.updateMatrixWorld();
//
//            console.log("NEW POSITION 3", final_position.x, final_position.y, final_position.z);
//
//            console.log("NEW POSITION 4", self.el.sceneEl.camera, self.el.sceneEl.camera.el.object3D, self.el.sceneEl.camera.el.object3D.position);

        });


        marker.appendChild(sphere);
        marker.appendChild(cone);
        marker.appendChild(text);
        button_row.appendChild(more);
//        button_row.appendChild(media);
//        button_row.appendChild(link);

        marker.appendChild(button_row);

        self.el.appendChild(marker);

    },


    // Create or update geometry

    update: function (oldData) {

        var self = this;

        console.log("UPDATING COMPONENT", self, self.data, self.prepared_data);


        if((self.prepared_data !== undefined) && (typeof(self.map_img) !== "undefined")) {

            // Iterate through objects and titles and delete them

            console.log("DELETING OLD GEOMETRY ...");

            // Regenerating new geometry

            console.log("REGENERATING NEW GEOMETRY ...");

//            self.rotation_undo =  - self.el.getAttribute("rotation").y;

            // Whatever needs to do to render...

//            self.render_template();

            // insert plane and project texture

//      <a-plane position="0 -2 -8" rotation="-90 0 " width="200" height="100" src="map2.png" repeat="10 10"></a-plane>


            // Insert a marker for each entry in data

            console.log("MARKERS BEGIN", self.prepared_data);

            self.marker_scale = d3.scale.linear().domain([0, self.data.canvas_size]).range([-(self.data.size/2), self.data.size/2]);

            self.prepared_data.forEach(function(datum,i){

                // Get x + y on the texture

                var coords = self.map.latLngToLayerPoint(L.latLng(datum.lat, datum.long));

                console.log(coords);

                if(((coords.x >= 0) && (coords.x < self.data.canvas_size)) && ((coords.y >= 0) && (coords.y < self.data.canvas_size))){

                    console.log("MARKER ENTRA", datum, coords, self.marker_scale.range(), self.marker_scale.domain(), self.data.map_y);

                    self.insert_marker(datum, {x: self.marker_scale(coords.x), y: self.data.map_y + self.data.marker_size, z: self.marker_scale(coords.y)}, i);

                }

            });

            // Map textured plane

            self.plane = document.createElement("a-circle");
//            self.plane = document.createElement("a-plane");


            console.log("MAP_Y", self.data.map_y);

            self.plane.setAttribute("position", {x:0, y: self.data.map_y, z: 0});
            self.plane.setAttribute("rotation","-90 0 0");
//            self.plane.setAttribute("width", self.data.size);
//            self.plane.setAttribute("height", self.data.size);
            self.plane.setAttribute("radius", self.data.size/2);
            self.plane.setAttribute("shader", "flat");

            self.plane.setAttribute("src", "#map_img");

            self.plane.setAttribute("shadow", {receive: true});

//            self.plane.setAttribute.src="#map_img";

            self.el.appendChild(self.plane);

            self.el.emit("dv_loaded", null, false);

        }
    },

    remove: function () {
        var self = this;

        self.map_div.parentNode.removeChild(self.map_div);
        self.map_img.parentNode.removeChild(self.map_img);

    }
});
