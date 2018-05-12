/**
 * Created by Oscar on 11/03/17.
 */


AFRAME.registerSystem('isotypes-radial-viz', {

    // Allow line component to accept vertices and color.

    schema: {},
    load_data: function(viz_name, path, tab, callback){

        DATAVERSE_VIZ_AUX.load_data(viz_name, path, tab, callback);

    },
    parse_data: function(data, component_data){

        var self = this;

        var final_data;

        final_data = data;

        return final_data;
    }
});


AFRAME.registerComponent('isotypes-radial-viz', {

    // Allow line component to accept vertices and color.

    schema: {
        source: {type: 'string', default: ""},
        tab: {type: 'string', default: ""},
        text_color: {type: 'string', default: "white"},
        text_background: {type: 'string', default: "#222"},
        text_font: {type: 'string', default: 'roboto'},
        legend_height: {type: 'float', default: 2.0},
        sublegend_height: {type: 'float', default: 1.0},
        legend_dmms: {type: 'float', default: 20},
        sublegend_dmms: {type: 'float', default: 16},
        general_button_dmms : {type: 'int', default: 20},
        theme: {'type': 'string', default: ""},
        size: {type: 'float', default: 5.0},
        title: {type: 'string', default: ""},
        explain: {type: 'string', default: ""},
        gap_ratio: {type: 'string', default: 0.1},
        group_gap: {type: 'float', default: 5},
        subgroup_gap: {type: 'float', default: 2.5},
        degrees: {type: 'float', default: 360}
    },

    init: function () {

        var self = this;

        // Load network data and 'prepare' it for rendering

        if (self.data.source !== "") {

            this.system.load_data("isotypes", self.data.source, self.data.tab, function (data, scene_data) {

                if(data!==null) {


                    self.scene_data = scene_data;

                    // Array to store objects in order to 'update' or delete them

                    self.objects = [];

                    // Array to titles in order to 'update' or delete them

                    self.titles = [];

                    self.isotype_data = self.system.parse_data(data, self.data);

                    console.log("FINAL DATA");
                    console.log(self.isotype_data);

                    self.color_scale = DATAVERSE_VIZ_AUX.get_color_scale_from_theme(self.data.theme);

                    // Call component update explicitly, since callback makes first update lag in data...

                    self.update();

                }
                else {
                    console.error("Could not load data file ", self.data.source);
                    console.log(self.isotype_data);
                }
            });
        }

    },

    render_one : function(datum, arc, img_dict){

        var self = this;

        console.log("RENDER ONE");

        var object = document.createElement("a-plane");

        object.setAttribute("transparent", true);
        object.setAttribute("shader", "flat");

        object.setAttribute("src", "#" + img_dict[datum.image]);

        if(datum.color.length > 1) {
            object.setAttribute("color", datum.color);
        }
        else {

            object.setAttribute("color", self.color_scale(datum.group + "_" + datum.subgroup_title));

        }

        // Set position, scale and color (also rotation to face the center of the circle or camera)

        object.setAttribute('rotation', {x:0, y:(arc/Math.PI)*180 + 180, z:0});

        var img = document.getElementById(img_dict[datum.image]);

        var width = img.naturalWidth;
        var height = img.naturalHeight;

        var plane_width = 2 * Math.sin((self.object_separation * (1 - self.data.gap_ratio))/2.0) * self.data.size;

        var plane_height = plane_width * (height/width);

        console.log("DIMENSIONS", width, height, plane_width, plane_height);

        object.setAttribute("height", plane_height);
        object.setAttribute("width", plane_width);

        object.setAttribute('position', {x: self.data.size * Math.sin(arc), y: plane_height/2.0, z: self.data.size * Math.cos(arc)});

        // Update max height for text layout purposes

        if(plane_height > self.max_height){

            self.max_height = plane_height;
        }

        self.el.appendChild(object);


    },

    // Raise event if all images are loaded

    check_images: function(){

        var self = this;

        var loaded = true;

        self.images.forEach(function(d,i){

            if(d.loaded === false){
                loaded = false;
            }

        });

        if(loaded){
            console.log("EMITO");
            self.el.emit("loaded_images", null, false);
        }


    },

    // Adds a 'more' button if applicable

    add_more_button: function(parent, datum, sequence, label_height){

        var self = this;

        console.log("AAA", datum);

        // Check if there is 'more' information. Only for subgroups or groups with no subgroups

        if((!('subgroups' in datum)) || (('subgroups' in datum) && (datum.subgroups == false))){

            console.log("AAB");

            var info = datum.datum;

            if(info.headline !== ""){

                var more_button = document.createElement("a-entity");

                var icon_radius = (self.data.general_button_dmms * self.data.size) / 1000;

                more_button.setAttribute("uipack-button", {icon_name: 'plus.png', radius: (self.data.general_button_dmms * self.data.size) / 1000});

                more_button.setAttribute("position", {x: 0, y: label_height, z: 0});

                parent.appendChild(more_button);


                more_button.addEventListener("click", function () {


                    // cam yaw rotation

                    var yaw = (self.el.sceneEl.camera.el.getAttribute("rotation").y) % 360;
                    var pitch = (self.el.sceneEl.camera.el.getAttribute("rotation").x) % 360;

                    console.log("MEDIA PANEL", self.el.sceneEl.media_panel);

                    if (self.el.sceneEl.media_panel) {
                        if (self.el.sceneEl.media_panel.parentNode) {
                            console.log("MEDIA PANEL ABIERTO");
                            self.el.sceneEl.media_panel.parentNode.removeChild(self.el.sceneEl.media_panel);
                        }
                    }

                    // insert a media_panel with datum, distance and yaw

                    self.media_panel = document.createElement("a-entity");

                    var cam_position = self.el.sceneEl.camera.el.getAttribute("position");

                    self.media_panel.setAttribute("position", {x: cam_position.x, y:cam_position.y, z: cam_position.z});


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
                        id: "isotype" + sequence
                    });

                    self.media_panel.addEventListener("link", function(data){
                        self.el.emit("link", {link: data.detail.link}, false);
                        console.log("LINKANDO A ", data.detail.link);
                    });


                    self.el.sceneEl.appendChild(self.media_panel);

                    self.el.sceneEl.media_panel = self.media_panel;



                });


            }

        }

    },

    // Create or update geometry

    update: function (oldData) {

        var self = this;

        if((self.isotype_data !== undefined) && (typeof(self.group_info) === "undefined")) {

            // Iterate through objects and titles and delete them

            console.log("DELETING OLD GEOMETRY ...");

            // Regenerating new geometry

            console.log("REGENERATING NEW GEOMETRY ...");

            // Initial counting variables

            self.num_groups = 0;

            self.num_subgroups = 0;

            self.num_objects = 0;

            self.group_info = {};

            self.subgroup_info = {};

            self.max_height = 0;

            var last_group = null;

            // Loop data and get counting variables at the end

            for(var i = 0; i < self.isotype_data.length; i++) {

                var datum = self.isotype_data[i];

                // Update groups if group has changed

                if(datum.group != last_group){

                    last_group = datum.group;

                    self.group_info[datum.group] = { 'start_radians': THREE.Math.DEG2RAD*self.data.degrees, 'end_radians': 0, 'title': datum.title, 'datum': datum, 'subgroups': false};

                    self.num_groups++;

                }

                // This is a subgroup

                if(datum.subgroup_title.length > 0) {

                    // Avoid group real_number since it's from this subgroup

//                    self.group_info[datum.group].datum.real_number = null;

                    self.group_info[datum.group].subgroups = true;

                    console.log("ANTES DE INSERTASR EL DATUM DEL SUBGROUP", datum);

                    self.subgroup_info[self.num_subgroups] = { 'group': datum.group, 'start_radians': THREE.Math.DEG2RAD*self.data.degrees, 'end_radians': 0, 'title': datum.subgroup_title, 'datum': datum};

                    self.num_subgroups++;

                }

                self.num_objects += datum.count;

            }

            console.log("END COUNTING");

            console.log("Groups", self.num_groups, "Sub groups", self.num_subgroups, "Objects", self.num_objects);
            console.log(self.group_info, self.subgroup_info);

            // Establish real (leaving out the gaps) radian length onto which distribute

            self.length = (THREE.Math.DEG2RAD*self.data.degrees) - ((self.num_groups) * (THREE.Math.DEG2RAD*self.data.group_gap)) - ((self.num_subgroups - 1) * (THREE.Math.DEG2RAD*self.data.subgroup_gap));

            self.object_separation = self.length / self.num_objects;

            console.log("LENGTH", self.length);

            console.log("SEPARATION", self.object_separation);

            // holds radians for painting every object

            var arc = 0;

            last_group = -1;

            var subgroup_number = -1;

            // Insert images in assets

            var assets = document.querySelector("a-assets");

            var img_dict = {};

            self.images = [];

            var img_counter = 0;

            // Insert every different img in assets

            for(var i=0; i < self.isotype_data.length; i++){

                console.log("VUELTA");

                var datum = self.isotype_data[i];

                var img = datum.image;

                console.log("IMAGE", img);

                if(!(datum.image in img_dict)){

                    var id = "img_" + img_counter;

                    img_dict[datum.image] = id;

                    var img_asset = document.createElement("img");
                    img_asset.setAttribute("id", id);
                    img_asset.setAttribute("src", datum.image);

                    assets.appendChild(img_asset);

                    self.images.push({'el': img_asset, 'id': id, 'loaded': false});

                    img_counter++;
                }
            }

            console.log(assets);

            // Now wait until all images are loaded...

            self.images.forEach(function(entry){

                    var img = entry.el;

                    img.addEventListener("load", function(){

                        entry.loaded = true;

                        console.log("LOADED", entry);

                        self.check_images();

                    });

            });


            self.el.addEventListener("loaded_images", function(){

                console.log("RECIBO");

                console.log("LOADED!!!");

                var rendered_number = 0;

                var arc = 0;


                // Iterate through elements again an 'paint' objects

                for (i = 0; i < self.isotype_data.length; i++) {

                    datum = self.isotype_data[i];

                    // Group change ?

                    if (datum.group != last_group) {

                        last_group = datum.group;
                        arc += THREE.Math.DEG2RAD * self.data.group_gap;

                        // Increment subgroup if *both* a group change and subgroup!= ""

                        if(datum.subgroup_title !== ""){
                            subgroup_number++;
                        }
                    }
                    else {
                        // Subgroup change

                        arc += THREE.Math.DEG2RAD * self.data.subgroup_gap;

                        subgroup_number++;

                    }

                    // Subgroup

                    var subgroup = datum.subgroup_title.length > 0;

                    // Paint objects

                    console.log("DATUM GROUP AND SUBGROUP", datum, datum.group, subgroup_number, subgroup);

                    for (var j = 0; j < datum.count; j++) {

                        // Update max and min arcs for this group (and) subgroup

                        if (arc < self.group_info[datum.group].start_radians) {
                            self.group_info[datum.group].start_radians = arc;
                        }
                        if (arc > self.group_info[datum.group].end_radians) {
                            self.group_info[datum.group].end_radians = arc;
                        }

                        if (subgroup) {

                            console.log("PARA EL SUBGROUP", subgroup_number, arc, self.subgroup_info[subgroup_number].start_radians, self.subgroup_info[subgroup_number].end_radians);

                            if (arc < self.subgroup_info[subgroup_number].start_radians) {
                                self.subgroup_info[subgroup_number].start_radians = arc;
                            }
                            if (arc > self.subgroup_info[subgroup_number].end_radians) {
                                self.subgroup_info[subgroup_number].end_radians = arc;
                            }

                        }

                        // Paint each object

                        self.render_one(datum, arc, img_dict);

                        rendered_number++;

                        // Update arc

                        arc += self.object_separation;

                    }

                }

                // Paint texts...

                console.log("FINAL GROUP DATA", self.group_info, self.subgroup_info);

                console.log("ANTES DE GROUP TEXTS ", self.max_height);

                var sequence = 0;

                // Paint group texts

                for (var i = 0; i < Object.keys(self.group_info).length; i++) {

                    datum = self.group_info[Object.keys(self.group_info)[i]];

                    console.log(datum);

                    var object = document.createElement("a-entity");

                    // Set position, scale and color (also rotation to face the center of the circle or camera)

                    var arc = (datum.start_radians + datum.end_radians) / 2.0;

                    object.setAttribute('position', {x: self.data.size * Math.sin(arc), y: self.data.legend_height, z: self.data.size * Math.cos(arc)});

                    // Face the center

                    object.setAttribute('rotation', {x: 0, y: (arc / Math.PI) * 180 > 180 ? (arc / Math.PI) * 180 - 180 : 180 + (arc / Math.PI) * 180, z: 0});

                    var title = (datum.datum.real_number && (!(datum.subgroups))) ? datum.title + " (" + datum.datum.real_number + ")": datum.title;

                    console.log("TITLE DATUM", datum);

                    var text_width = (self.data.legend_dmms * self.data.size * (title.length + 4)) / 1000;

                    object.setAttribute('text', {value: title, align: "center", font: self.data.theme ? DATAVERSE.themes[self.data.theme].text_font : self.data.text_font,color: self.data.theme ? DATAVERSE.themes[self.data.theme].text_color : self.data.text_color, width: text_width, wrapCount: title.length + 4, zOffset: 0.01});

                    var label_height = ((self.data.legend_dmms * self.data.size) / 1000)*3;

                    object.setAttribute("geometry", {primitive: "plane", height: label_height, width: "auto"});

                    object.setAttribute("material", {color: self.data.theme ? DATAVERSE.themes[self.data.theme].text_background : self.data.text_background, shader: "flat"});

                    self.add_more_button(object, datum, sequence, label_height);

                    self.el.appendChild(object);

                    sequence++;

                }

                console.log("SUBGROUP INFO", self.subgroup_info);

                console.log("PAINTING SUBGROUP LABELS");

                for (i = 0; i < Object.keys(self.subgroup_info).length; i++) {

                    datum = self.subgroup_info[Object.keys(self.subgroup_info)[i]];

                    object = document.createElement("a-entity");

                    // Set position, scale and color (also rotation to face the center of the circle or camera)

                    arc = (datum.start_radians + datum.end_radians) / 2.0;

                    object.setAttribute('position', {x: self.data.size * Math.sin(arc), y: self.data.sublegend_height, z: self.data.size * Math.cos(arc)});

                    // Face the center

                    object.setAttribute('rotation', {x: 0, y: (arc / Math.PI) * 180 > 180 ? (arc / Math.PI) * 180 - 180 : 180 + (arc / Math.PI) * 180, z: 0});

                    var title = datum.datum.real_number ? datum.title + " (" + datum.datum.real_number + ")": datum.title;

                    console.log("SUBTITLE DATUM", datum, arc);

                    var text_width = (self.data.sublegend_dmms * self.data.size * (title.length + 4)) / 1000;

                    var label_height = ((self.data.sublegend_dmms * self.data.size) / 1000)*3;

                    object.setAttribute('text', {value: title, font: self.data.theme ? DATAVERSE.themes[self.data.theme].text_font : self.data.text_font, align: "center", color: self.data.theme ? DATAVERSE.themes[self.data.theme].text_color : self.data.text_color, width: text_width, wrapCount: title.length + 4, zOffset:0.01});

                    object.setAttribute("geometry", {primitive: "plane", height: label_height, width: "auto"});

                    object.setAttribute("material", {color: self.data.theme ? DATAVERSE.themes[self.data.theme].text_background : self.data.text_background, shader: "flat"});

                    self.add_more_button(object, datum, sequence, label_height);

                    self.el.appendChild(object);

                }

                self.el.emit("dv_loaded", null, false);

            });



        }
    },

    remove: function () {

    }
});
