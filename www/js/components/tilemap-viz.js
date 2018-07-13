/**
 * Created by Oscar on 11/03/17.
 */


AFRAME.registerComponent("face-camera",{

    // Some standard properties right here...

    schema: {
    },

    init: function () {
        var self = this;
        self.vector = new THREE.Vector3();

    },
    update: function(oldData){

        var self = this;

    },
    tick: function(oldData) {

        var self = this;

        self.cameraObject = self.el.sceneEl.camera;

        var cam_position = new THREE.Vector3();

        cam_position.setFromMatrixPosition(self.cameraObject.matrixWorld);


        var worldPos = new THREE.Vector3();
        worldPos.setFromMatrixPosition(self.el.object3D.matrixWorld);

        var diff_y = cam_position.clone().sub(worldPos).setY(0).normalize();

        var diff_x = cam_position.clone().sub(worldPos).setX(0).normalize();

        var diff = cam_position.clone().sub(worldPos).normalize();


        var el_rotation = self.el.getAttribute("rotation");

        el_rotation.y = Math.atan2(diff_y.x, diff_y.z) * 180 / Math.PI;

        self.el.setAttribute("rotation", el_rotation);


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
        // This is just an adjustment to always have an unmutable reference to default provider
        default_provider: {type: 'string', default: "CartoDB.Positron"},
        lat: {type: 'float', default: 51.4825757},
        long: {type: 'float', default: -0.0164351},
        zoom: {type: 'number', default: 18},
        size: {type: 'number', default: 10},
        canvas_size: {type: 'number', default: 2048},
        marker_size: {type: 'number', default: 0.25},
        text_color: {type: 'string', default: "white"},
        text_font: {type: 'string', default: "roboto"},
        text_background: {type: 'string', default: "black"},
        text_attribution_color: {type: 'string', default: "#48a4cd"},
        map_y: {type: 'float', default: 0.0}
    },

    init: function () {

        var self = this;

        self.panel_timestamp = Date.now();

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

                    self.map_div.style['z-index'] = -9999;

                    var body = document.querySelector("body");

                    body.appendChild(self.map_div);

                    self.map = L.map('map').setView([self.data.lat, self.data.long], self.data.zoom);

                    // If provider comes thorught sheet params ==> self.data.theme && self.data.provider !== "CartoDB.Positron"

                    if(self.data.theme && self.data.provider !== self.data.default_provider){

                        self.layer = L.tileLayer.provider(self.data.provider, {crossOrigin: true});

                    }
                    else {

                        self.layer = L.tileLayer.provider(self.data.theme ? DATAVERSE.themes[self.data.theme].map_provider : self.data.provider, {crossOrigin: true});
                    }

                    self.layer.addTo(self.map);

//                    https://stackoverflow.com/questions/28873713/leaflet-event-on-tiles-loading?rq=1

                        self.layer.on("load", function() {

                            html2canvas(document.getElementById("map"), {

                                useCORS: true,
                                onrendered: function (canvas) {

                                    var interval_function = function() {

                                        self.map_texture = new THREE.CanvasTexture(canvas);

                                        self.update();

                                    };


                                    setTimeout(interval_function, 1000);

                                }
                            });
                        });
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

        var marker = document.createElement("a-entity");

        marker.classList.add("marker");

        marker.__data__ = datum;

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

        var text = document.createElement("a-entity");


        var text_width = (DATAVERSE.dmms.map_label * (self.data.size/2) * (datum.headline.length + 2)) / 1000;

        text.setAttribute("text", {value: datum.headline, align: "center",
            color: self.data.theme ? DATAVERSE.themes[self.data.theme].text_color : self.data.label_color,
            font: self.data.theme ? DATAVERSE.themes[self.data.theme].text_font : self.data.label_font,
            width: text_width, wrapCount: datum.headline.length + 4, zOffset: 0.01});


        var label_height = (DATAVERSE.dmms.map_label * (self.data.size/2) / 1000)*3;

        text.setAttribute("geometry", {primitive: "plane", height: label_height, width: "auto"});

        text.setAttribute("material", {color: self.data.theme ? DATAVERSE.themes[self.data.theme].text_background : self.data.text_background, shader: "flat", opacity: 0.2, transparent: true});

        text.setAttribute("position", {x:0, y: (self.data.marker_size / 2) + (text_width / 2) + icon_radius*2, z:0});
        text.setAttribute("rotation", {x:0, y: 0, z:90});

        text.setAttribute("face-camera", "");


        var button_row = document.createElement("a-entity");

        button_row.setAttribute("position", {x:0, y: 0, z:0});

        button_row.setAttribute("face-camera", "");

        button_row.setAttribute("rotation", {x:0, y: 0, z:0});


        var more = document.createElement("a-entity");

        more.setAttribute("uipack-button", {'theme': self.data.theme, 'icon_name': 'plus.png', 'radius': icon_radius});

        more.setAttribute("position", {x: 0, y:  icon_radius*1.5, z:0});


        more.addEventListener("clicked", function(){

            // Retore trigger as clickable (just in case it is cross-launched)


            if (self.el.sceneEl.restore_clickable) {
                self.el.sceneEl.restore_clickable.classList.add("clickable");
            }

            // distance between camera and this

            var distance = DATAVERSE_VIZ_AUX.get_distance_xz(self.el.sceneEl.camera.el, this);

            // cam yaw rotation

            var yaw = (self.el.sceneEl.camera.el.getAttribute("rotation").y) % 360;
            var pitch = (self.el.sceneEl.camera.el.getAttribute("rotation").x) % 360;

            if(self.media_panel){

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

            // Hide all markers before showing media_panel

            var els = self.el.sceneEl.querySelectorAll('.marker');

            for (var i = 0; i < els.length; i++) {

                var el = els[i];


                    el.setAttribute("visible", false);
            }

            self.media_panel.setAttribute("position", self.media_panel_position);


            self.media_panel.setAttribute("shadow", {cast:true});

            self.media_panel.classList.add("dataverse-added");

            self.media_panel.setAttribute("uipack-mediapanel", {
                yaw: yaw,
                distance: DATAVERSE.distances.panel,
                theme: self.data.theme,
                title: datum.headline,
                text: datum.text,
                low_height: 1,
                media_url: datum.media,
                media_caption: datum['media_caption'],
                media_credit: datum['media_credit'],
                link: datum.link,
                link_thumbnail: DATAVERSE_VIZ_AUX.get_scene_thumbnail(datum.link, self.scene_data),
                link_type: DATAVERSE_VIZ_AUX.get_scene_type(datum.link, self.scene_data),
                id: "marker_" + number + "_" +  self.panel_timestamp

            });

            self.media_panel.addEventListener("link", function(data){
                self.el.emit("link", {link: data.detail.link}, false);
            });


            self.media_panel.addEventListener("panel_closed", function(){

                // Hide all markers before showing media_panel

                var els = self.el.sceneEl.querySelectorAll('.marker');

                for (var i = 0; i < els.length; i++) {

                    var el = els[i];

                    el.setAttribute("visible", true);
                }

            });

            self.el.appendChild(self.media_panel);

            self.el.sceneEl.restore_clickable = this;

            self.el.sceneEl.restore_clickable.classList.remove("clickable");


        });


        var link = document.createElement("a-entity");
        link.setAttribute("uipack-button", {'theme': self.data.theme, 'icon_name': 'arrow-up.png', 'radius': icon_radius});

        link.setAttribute("position", {x: 0, y: icon_radius*4.0, z:0});

        link.addEventListener("clicked", function(){

            var cam_position = self.el.sceneEl.camera.el.getAttribute("position");

            var new_position = DATAVERSE_VIZ_AUX.cam_destination_to_object(self.el.sceneEl.camera.el, marker, 0.5);

            var differences = {x: new_position.x - cam_position.x, y: new_position.y - cam_position.y, z: new_position.z - cam_position.z};

            // Move element instead of moving camera....

            var component_position = self.el.getAttribute("position");

            self.el.setAttribute("position", {x: component_position.x - differences.x, y: component_position.y - differences.y, z: component_position.z - differences.z});


        });


        marker.appendChild(sphere);
        marker.appendChild(cone);
        marker.appendChild(text);
        button_row.appendChild(more);
        marker.appendChild(button_row);

        self.el.appendChild(marker);

    },

    put_attribution: function(){

        var self = this;

        var attr_string = self.layer.options.attribution;

        // Convert copyright to (c)

        attr_string = attr_string.replace(/&copy;/gi, "(c)");
        attr_string = attr_string.replace(/&mdash;/gi, "--");

        // Remove links

        attr_string = attr_string.replace(/<.*?>/gi, "");

        var text = document.createElement("a-entity");

        var text_width = (DATAVERSE.dmms.map_attribution * (1.6) * (attr_string.length + 2)) / 1000;


        text.setAttribute("text", {value: attr_string, align: "center",
            color: self.data.theme ? DATAVERSE.themes[self.data.theme].text_attribution_color : self.data.text_attribution_color,
            font: self.data.theme ? DATAVERSE.themes[self.data.theme].text_font : self.data.label_font,
            width: text_width, wrapCount: attr_string.length + 2, zOffset: 0.01});


        var label_height = (DATAVERSE.dmms.map_attribution * (1.6) / 1000)*3;

        text.setAttribute("geometry", {primitive: "plane", height: label_height, width: "auto"});

        text.setAttribute("material", {color: self.data.theme ? DATAVERSE.themes[self.data.theme].text_background : self.data.text_background, shader: "flat", opacity: 0.5, transparent: true});

        text.setAttribute("position", {x:0, y: 0.1, z:0});
        text.setAttribute("rotation", {x:-90, y: 0, z:0});

        self.el.appendChild(text);

    },


    // Create or update geometry

    update: function (oldData) {

        var self = this;

        if((self.prepared_data !== undefined) && (typeof(self.map_texture) !== "undefined")) {

            // Insert a marker for each entry in data

            self.marker_scale = d3.scale.linear().domain([0, self.data.canvas_size]).range([-(self.data.size/2), self.data.size/2]);

            self.prepared_data.forEach(function(datum,i){

                // Get x + y on the texture

                var coords = self.map.latLngToLayerPoint(L.latLng(datum.lat, datum.long));

                if(((coords.x >= 0) && (coords.x < self.data.canvas_size)) && ((coords.y >= 0) && (coords.y < self.data.canvas_size))){

                    self.insert_marker(datum, {x: self.marker_scale(coords.x), y: self.data.map_y + self.data.marker_size, z: self.marker_scale(coords.y)}, i);

                }

            });

            // Map textured plane

            self.plane = document.createElement("a-circle");

            self.plane.setAttribute("position", {x:0, y: self.data.map_y, z: 0});
            self.plane.setAttribute("rotation","-90 0 0");
            self.plane.setAttribute("radius", self.data.size/2);

            self.el.appendChild(self.plane);

            self.plane.addEventListener("loaded", function(evt){

                self.plane.getObject3D('mesh').material = new THREE.MeshBasicMaterial({ map: self.map_texture});

            });

            // Set attribution text

            self.put_attribution();

            self.el.emit("dv_loaded", null, false);

        }
    },

    remove: function () {
        var self = this;

        self.map_div.parentNode.removeChild(self.map_div);

        if(self.map_texture){
//            console.log("DISPOSING TEXTURE");
//            self.map_texture.dispose();
        }

    }
});
