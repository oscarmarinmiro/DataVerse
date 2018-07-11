/**
 * Created by Oscar on 11/03/17.
 */


AFRAME.registerSystem('geo-viz', {

    // Aux functions to load data plus parse data

    schema: {},

    load_data: function(viz_name, path, tab, callback){

        DATAVERSE_VIZ_AUX.load_data(viz_name, path, tab, callback);

    },

    parse_data: function(data, component_data){

        var self = this;

        var final_data = {};

        return data;
    }
});


AFRAME.registerComponent('geo-viz', {

    // Allow line component to accept vertices and color.

    schema: {
        initial_delay: {type: 'number', default: 7000},
        source: {type: 'string', default: ""},
        tab: {type: 'string', default: ""},
        theme: {'type': 'string', default: ""},
        point_radius: {type: 'number', default: -1},
        point_radius_max: {type: 'number', default: 3.0},
        point_radius_min: {type: 'number', default: 1.0},
        arc_color: {type: 'string', default: "red"},
        point_color: {type: 'string', default: ""},
        radius: {'type': 'number', default: 50.0},
        legend_dmms: {'type': 'number', default: 12.0},
        text_color: {'type': 'string', default: "white"},
        text_font: {'type': 'string', default: "roboto"},
        earth_texture: {type: 'string', default: "img/8081-earthmap10k.jpg"},
        title: {type: 'string', default: ""},
        debug: {type: 'boolean', default: false}
    },

    init: function () {

        var self = this;

        self.rendered = false;

        self.panel_timestamp = Date.now();

        // Load network data and 'prepare' it for rendering

        if (self.data.source !== "") {

            this.system.load_data("geo-viz", self.data.source, self.data.tab, function (data, scene_data) {

                if(data!==null) {

                    console.log("DATA!", data, scene_data);

                    self.scene_data = scene_data;

                    console.log(self.scene_data);

                    self.geo_data = data;

                    console.log("FINAL DATA");
                    console.log(self.geo_data);


                    console.log("PARAM DATA");
                    console.log(self.data);

                    // Call component update explicitly, since callback makes first update lag in data...

                    self.update();

                }
                else {
                    console.error("Could not load data file ", self.data.source);
                    console.log(self.geo_data);
                }
            });
        }

    },

    // Calculates max-mins for every type of geometry and param, and store into a struct

    calculate_max_mins: function() {

        var self = this;

        self.max_mins = {'radius':[]};

        // Iterate features

        console.log("MAX MINS FEATURES BROWSING");

        self.geo_data.forEach(function(datum){

                // Point radius is variable

                self.max_mins.radius.push(datum.value);

        });

        console.log("MAX MINS FEATURES CALCULATION");


            Object.keys(self.max_mins).forEach(function(property){

                var vector = self.max_mins[property];


                if(vector.length > 0) {

                    console.log("VECTOR", property, vector);

                    var max = d3.max(vector);
                    var min = d3.min(vector);

                    self.max_mins[property] = {'max': max, 'min': min,
                        'scale': property === "radius" ? d3.scale.sqrt().domain([min, max]).range([self.data[["point", property, 'min'].join("_")], self.data[["point", property, 'max'].join("_")]]).clamp(true)
                            : d3.scale.linear().domain([min, max]).range([self.data[["point", property, 'min'].join("_")], self.data[["point", property, 'max'].join("_")]]).clamp(true)
                    };
                }

        });

        console.log("RESULTING VALUES FROM MAX MINS", self.max_mins);

    },

    render_a_point: function(datum, index){

        var self = this;

        // Get lat, lon

        // Just in case there are strings in the geometry

        var lon = datum.long;

        var lat = datum.lat;

        // Get center of circle from 'eart' radius, lat and long

        var point_coords = self.from_lat_lon_to_point(lat, lon, 0.95);

        var x = point_coords.x;
        var y = point_coords.y;
        var z = point_coords.z;

        console.log("COORDS", x, y, z);

        var point = document.createElement("a-circle");


        point.setAttribute("color", (function(){


                if(datum.color !== "") {

                    return datum.color;
                }
                else {

                    return DATAVERSE_VIZ_AUX.get_default_color_from_theme(self.data.theme);
                }


         })());


        point.setAttribute("radius", (function(){

            // If the value is a scale, else a constant radius

            if(self.data.point_radius == -1){

                console.log("VARIABLE RADIUS", datum.value);

                return self.max_mins['radius']['scale'](datum.value);
            }
            else {

                console.log("CONSTANT RADIUS");

                return self.data.point_radius;
            }


        })());

        point.setAttribute("position", {x: x, y:y, z:z});
        point.setAttribute("rotation", {x: lat, y: -(lon + 90), z:0});

        console.log("ROTACIONES", {x:lat,y: -(lon+90), z:0});



        // Calculate latitude offset based on earth radius and circle radius

        var lat_offset = THREE.Math.radToDeg(Math.atan(point.getAttribute("radius") / self.data.radius)) + 2;

        point.classList.add("geo_geometry");

        point.classList.add("clickable");

        self.el.appendChild(point);

        if(datum.headline != ""){

            var legend = document.createElement("a-text");

            legend.classList.add("geo_geometry");

            var my_text = datum.headline;

            legend.setAttribute("value", my_text);

            // Get lat, lon

            var text_lon = datum.long;

            // Such that legend is above geometry

            var text_lat = datum.lat + lat_offset;

            // Get center of circle from 'eart' radius, text_lat and long

            var text_point = self.from_lat_lon_to_point(text_lat, text_lon, 0.90);

            legend.setAttribute("position", {x: text_point.x, y: text_point.y, z: text_point.z});
            legend.setAttribute("rotation", {x: text_lat, y: -(text_lon + 90), z:0});

            legend.setAttribute("scale", {x: self.data.point_legend_scale, y: self.data.point_legend_scale, z: self.data.point_legend_scale});

            legend.setAttribute("align", "center");
            legend.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].text_color : self.data.text_color);
            legend.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].text_font : self.data.text_font);

            legend.setAttribute("width", (self.data.legend_dmms * self.data.radius * (datum.headline.length + 4)) / 1000);

            legend.setAttribute("wrap-count", datum.headline.length + 4);

            self.el.appendChild(legend);
        }


        console.log("El radio del circulo es de", point.getAttribute("radius"), lat_offset);

        self.button_mode = (DATAVERSE && ('cursor_mode' in DATAVERSE)) ? DATAVERSE.cursor_mode : "desktop";

        if(self.button_mode === "desktop") {

            var comp_data = self.data;

            point.addEventListener('mousedown', function(event){

                console.log("MOUSEDOWN");

                var sound = new Howl({src: DATAVERSE.paths.click_sound, volume: 0.25});

                sound.play();

                point.emit("clicked", null, false);


            });

            point.addEventListener("mouseenter", function (event){

                self.el.sceneEl.canvas.classList.remove("a-grab-cursor");


            });

            point.addEventListener("mouseleave", function (event){

                self.el.sceneEl.canvas.classList.add("a-grab-cursor");

            });


        }
        else {

            point.first_hover = true;

            var comp_data = self.data;

            point.addEventListener('raycaster-intersected', function (event) {

                var self = this;

                // First 'fresh' hover

                if (self.first_hover) {

                    // Insert ring for animation on hover

                    self.ring = document.createElement("a-ring");
                    self.ring.setAttribute("radius-inner", self.getAttribute("radius") * 1.0);
                    self.ring.setAttribute("radius-outer", self.getAttribute("radius") * 1.2);
                    self.ring.setAttribute("material", "color:" + (comp_data.theme ? DATAVERSE.themes[comp_data.theme].arc_color : self.data.arc_color));
                    self.ring.setAttribute("visible", true);

                    self.appendChild(self.ring);

                    // Create animation

                    self.animation = document.createElement("a-animation");
                    self.animation.setAttribute("easing", "linear");
                    self.animation.setAttribute("attribute", "geometry.thetaLength");
                    self.animation.setAttribute("dur", DATAVERSE.animation.geo);
                    self.animation.setAttribute("from", "0");
                    self.animation.setAttribute("to", "360");
                    //
                    self.ring.appendChild(self.animation);

                    var component = self.el;


                    self.first_hover = false;

                    //                var sound = new Howl({src: DATAVERSE.paths.hover_sound, volume: 0.25, rate: 0.5});
                    //
                    //                sound.play();


                    // Emit 'clicked' on ring animation end

                    self.animation.addEventListener("animationend", function () {

                        var ring = this.parentNode;

                        var point = ring.parentNode;

                        setTimeout(function () {
                            self.first_hover = true;
                        }, 500);

                        var sound = new Howl({src: DATAVERSE.paths.click_sound, volume: 0.25});

                        sound.play();

                        point.emit("clicked", null, false);

                        point.removeChild(self.ring);


                    });
                }
            });

            point.addEventListener('raycaster-intersected-cleared', function (event) {

                var self = this;

                self.first_hover = true;

                // Change cursor color and scale


                // Remove ring if existing

                if (self.ring.parentNode) {

                    self.ring.parentNode.removeChild(self.ring);
                }

            });
        }


        var theme = self.data.theme;

        var entity = self.el;

        var component = self;

        var panel_timestamp = self.panel_timestamp;

        // Launch mediapanel

        point.addEventListener("clicked", function(event){

                var self = this;

                // Retore trigger as clickable (just in case it is cross-launched)


                if (component.el.sceneEl.restore_clickable) {
                    component.el.sceneEl.restore_clickable.classList.add("clickable");
                }


               // distance between camera and this

                var distance = DATAVERSE_VIZ_AUX.get_distance_xz(self.sceneEl.camera.el, this);

                // cam yaw rotation

                var yaw = (self.sceneEl.camera.el.getAttribute("rotation").y) % 360;
                var pitch = (self.sceneEl.camera.el.getAttribute("rotation").x) % 360;

                console.log("MEDIA PANEL", self.sceneEl.media_panel);

                if (self.sceneEl.media_panel) {
                    if (self.sceneEl.media_panel.parentNode) {

                        if(self.sceneEl.media_panel_id === index) { return;}
                        console.log("MEDIA PANEL ABIERTO");
                        self.sceneEl.media_panel.parentNode.removeChild(self.sceneEl.media_panel);
                    }
                }

                // insert a media_panel with datum, distance and yaw

                self.media_panel = document.createElement("a-entity");

                self.media_panel.setAttribute("position", self.sceneEl.camera.el.getAttribute("position"));


                self.media_panel.setAttribute("shadow", {cast: true});

                console.log("DATUM!", datum);

                console.log("PANEL TIMESTAMP", self.panel_timestamp);

                self.media_panel.classList.add("dataverse-added");

                self.media_panel.setAttribute("uipack-mediapanel", {
                    yaw: yaw,
                    theme: theme,
                    distance: DATAVERSE.distances.panel,
                    title: datum.headline,
                    text: datum.text,
                    media_url: datum.media,
                    media_caption: datum.media_caption,
                    media_credit: datum.media_credit,
                    link: datum.link,
                    link_thumbnail: DATAVERSE_VIZ_AUX.get_scene_thumbnail(datum.link, component.scene_data),
                    link_type: DATAVERSE_VIZ_AUX.get_scene_type(datum.link, component.scene_data),
                    id: "point_" + index + "_" + panel_timestamp

                });

                self.media_panel.addEventListener("link", function(data){
                    entity.emit("link", {link: data.detail.link}, false);
                    console.log("LINKANDO A ", data.detail.link);
                });


                self.sceneEl.appendChild(self.media_panel);

                self.sceneEl.media_panel = self.media_panel;

                self.sceneEl.media_panel_id = index;

                component.el.sceneEl.restore_clickable = this;

                component.el.sceneEl.restore_clickable.classList.remove("clickable");


        });



    },

    // Go from lat lon to x,y,z

    from_lat_lon_to_point: function(lat, lon, depth){

        var self = this;

        return {'x': self.data.radius*depth * Math.cos(THREE.Math.degToRad(lat)) * Math.cos(THREE.Math.degToRad(lon)),
                'y':  self.data.radius*depth * Math.sin(THREE.Math.degToRad(lat)),
                'z': self.data.radius*depth * Math.cos(THREE.Math.degToRad(lat)) * Math.sin(THREE.Math.degToRad(lon))
        };

    },

    // Render points in data

    render_points: function(){

        var self = this;

        var points = self.geo_data;

        points.forEach(function(point, i){

           self.render_a_point(point, i);

        });

    },


    // Render 'earth'

    render_earth: function(){

        var self = this;

        var assets = document.getElementsByTagName("a-assets")[0];

        // insert img asset

        var img_asset = document.createElement("img");

        img_asset.setAttribute("id", "skymap");
        img_asset.setAttribute("crossorigin", "anonymous");
        img_asset.setAttribute("src", self.data.theme ? DATAVERSE.themes[self.data.theme].earth_texture : self.data.earth_texture);

        assets.appendChild(img_asset);

        self.map_sphere = document.createElement("a-sphere");

        self.map_sphere.classList.add("skyspheres");
        self.map_sphere.classList.add("dataverse-added");
        self.map_sphere.setAttribute("visible", false);

        self.map_sphere.setAttribute("geometry", {primitive: "sphere", radius:self.data.radius, segmentsWidth: 64, segmentsHeight:64});
        self.map_sphere.setAttribute("material", {shader: "flat", src: "#skymap", side: "back"});
        self.map_sphere.setAttribute("scale", "1 1 -1");

        // Get rotation from parent element (for cam syncing on landing)

        self.map_sphere.setAttribute("rotation", {x:0, y: self.el.getAttribute("rotation").y, z:0});


        // Set position to the same as the cam (=user) such that points are correctly rendered

        self.map_sphere.setAttribute("position", self.el.getAttribute("position"));



//        self.map_sphere.setAttribute("scale", "1.0 1.0 -1.0");
//
//        self.map_sphere.setAttribute("src", "#skymap");
//
//        self.map_sphere.setAttribute("radius", self.data.radius);

        // Inform to parent

        img_asset.addEventListener("load", function(){

                console.log("LOADED IMG");

                // Calculating max-mins for points, lines and polygons

                self.calculate_max_mins();

                // Render points

                self.render_points();

                self.el.emit("dv_loaded", null, false);

        });

//        self.map_sphere.addEventListener("materialtextureloaded", function(){
//
//            console.log("CARGADA TEXTURA");
//
//            // Calculating max-mins for points, lines and polygons
//
//            self.calculate_max_mins();
//
//            // Render points
//
//            self.render_points();
//
//            self.el.emit("dv_loaded", null, false);
//        });

        console.log("EL SELF", self);

        self.el.sceneEl.appendChild(self.map_sphere);

    },

    // Create or update geometry

    update: function (oldData) {

        var self = this;

        if((self.geo_data !== undefined) && (!(self.rendered))) {

            self.rendered = true;

            // Iterate through objects and titles and delete them

            console.log("DELETING OLD GEOMETRY ...");

            // Regenerating new geometry

            console.log("REGENERATING NEW GEOMETRY ...");

            // Render 'Earth'

            self.render_earth();


        }
    },

    remove: function () {

    }
});
