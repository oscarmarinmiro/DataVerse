AFRAME.registerSystem('photogrid-viz', {

    schema: {},

    init: function(){

        var self = this;


    },
    load_data: function(viz_name, path, tab, callback){

        DATAVERSE_VIZ_AUX.load_data(viz_name, path, tab, callback);

    },

    parse_data: function(data, component_data) {

        var self = this;

        return data;

    }
});


AFRAME.registerComponent('photogrid-viz', {

    schema: {
        source: {type: 'string', default: ""},
        tab: {type: 'string', default: ""},
        text_color: {type: 'string', default: 'white'},
        text_font: {type: 'string', default: 'roboto'},
        theme: {'type': 'string', default: ""},
        width: {type: 'float', default: 15},
        rows: {type: 'int', default: 3},
        distance: {type: 'float', default: 10.0},
        form_factor_x: {type: 'float', default: 1.25},
        form_factor_y: {type: 'float', default: 1.5},
        general_text_dmms : {type: 'int', default: 30},
        general_button_dmms : {type: 'int', default: 20}

    },

    init: function () {

        var self = this;

        self.rendered = false;

        console.log("INIT SMALL TREEMAP COMPONENT", self.data);

        if (self.data.source !== "") {

            this.system.load_data("photogrid", self.data.source, self.data.tab, function (data, scene_data) {

                if (data !== null) {

                    self.scene_data = scene_data;

                    console.log("SELF", self.scene_data);

                    self.parsed_data = self.system.parse_data(data, self.data);

                    self.update();


                }
            });
        }


    },
    insert_a_thumbnail: function(thumbnail, params, i, j, max_title_length, last){

        var self = this;

        var position = last ? {x: params.last_horizontal_scale(j), y: params.vertical_scale(i), z: -self.data.distance}:{x: params.horizontal_scale(j), y: params.vertical_scale(i), z: -self.data.distance};


        var thumbnail_component = document.createElement("a-plane");

        thumbnail_component.setAttribute("width", params.thumbnail_size);
        thumbnail_component.setAttribute("height", params.thumbnail_size);
        thumbnail_component.setAttribute("material", {shader: "flat"});
        thumbnail_component.setAttribute("src", thumbnail.image);

        thumbnail_component.setAttribute("position", position);

        // Resizing and cropping

        thumbnail_component.addEventListener("materialtextureloaded", function(){

            console.log("LOADED");

            if(('material' in this.components.material) && ('material' in this.components.material) && (this.components.material.material.map) && ('image' in this.components.material.material.map)) {

                var width = this.components.material.material.map.image.naturalWidth;
                var height = this.components.material.material.map.image.naturalHeight;

                if (width >= height) {
                    this.components.material.material.map.repeat = {x: height / width, y: 1};
                    this.components.material.material.map.offset = {x: (1 - (height / width)) / 2, y: 0.0};
                }
                else {
                    this.components.material.material.map.repeat = {x: 1, y: width / height};
                    this.components.material.material.map.offset = {x: 0.0, y: (1 - (width / height)) / 2};
                }

                this.components.material.material.map.needsUpdate = true;
            }

        });

        var label = document.createElement("a-text");


        label.setAttribute("value", thumbnail.headline);
        label.setAttribute("align", "center");
        label.setAttribute("width",  params.thumbnail_size * self.data.form_factor_x);

        label.setAttribute("wrap-count", max_title_length);

        label.setAttribute("position", {x: 0, y: params.thumbnail_size*0.6, z:0});

        label.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].text_color : self.data.text_color);
        label.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].text_font : self.data.text_font);


        thumbnail_component.appendChild(label);


        self.el.appendChild(thumbnail_component);

        if((thumbnail.text != "") || (thumbnail.media != "") || (thumbnail.media_credit != "") || (thumbnail.media_caption != "") || (thumbnail.link != "")) {

            var more_button = document.createElement("a-entity");

            more_button.setAttribute("uipack-button", { theme: self.data.theme, icon_name: 'plus.png', radius: (self.data.general_button_dmms * self.data.distance) / 1000});

            more_button.setAttribute("position", {x: 0, y: params.thumbnail_size * 0.8, z: 0});

            thumbnail_component.appendChild(more_button);


            more_button.addEventListener("click", function () {


                // Retore trigger as clickable (just in case it is cross-launched)


                if (self.el.sceneEl.restore_clickable) {
                    self.el.sceneEl.restore_clickable.classList.add("clickable");
                }


                // distance between camera and this

                var distance = DATAVERSE_VIZ_AUX.get_distance_xz(self.el.sceneEl.camera.el, this);

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

                self.media_panel.setAttribute("position", self.el.sceneEl.camera.el.getAttribute("position"));

                self.media_panel.setAttribute("shadow", {cast: true});

                console.log("RENDERING THIS DATUM", thumbnail, self.scene_data);

                self.media_panel.setAttribute("uipack-mediapanel", {
                    yaw: yaw,
                    pitch: pitch,
                    theme: self.data.theme,
                    distance: 1.5,
                    title: thumbnail.headline,
                    subtitle: "",
                    text: thumbnail.text,
                    media_url: thumbnail.media,
                    media_caption: thumbnail.media_caption,
                    media_credit: thumbnail.media_credit,
                    link: thumbnail.link,
                    link_thumbnail: DATAVERSE_VIZ_AUX.get_scene_thumbnail(thumbnail.link, self.scene_data),
                    link_type: DATAVERSE_VIZ_AUX.get_scene_type(thumbnail.link, self.scene_data),
                    id: "treemap_" + i + "_" + j
                });

                self.media_panel.addEventListener("link", function(data){
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

    update: function (oldData) {

        var self = this;


        if((self.parsed_data) && (!(self.rendered))) {

            self.rendered = true;

            console.log("UPDATING PHOTO GRID COMPONENT", self.data);

            console.log("REMOVING OLD GEOMETRY...");

            if (self.el.children && self.el.children.length > 0) {

                console.log(self.el.children);

                for(var i=0; i < self.el.children.length; i++) {

                    self.el.removeChild(self.el.children[i]);
                }
            }

            // One treemap per keyword in self.prepared_data

            console.log("PARSED DATA", self.parsed_data);

            // Move parent entity to eye level

            self.el.setAttribute("position", {x: 0, y: self.el.sceneEl.camera.el.getAttribute("position").y, z:0});

            // Set scales, sizes, etc....

            // Iterate through data draw the thumbnails (separate function that renders thumbnail, title, 'more' and '360' button

            // Get max length of treemap titles

            var max_title_length = (self.parsed_data.slice(0).sort(function(a,b) { return b.headline.length - a.headline.length;}))[0].headline.length;

            console.log("MAX TITLE", max_title_length);

            var params = {};

            params.thumbnail_number = self.parsed_data.length;

            params.number_cols = Math.ceil(params.thumbnail_number / self.data.rows);

            params.last_row_cols = params.thumbnail_number - ((self.data.rows-1) * params.number_cols);

            params.thumbnail_size = self.data.width / ((params.number_cols-1) * self.data.form_factor_x);

            params.vertical_span = params.thumbnail_size * self.data.form_factor_y * (self.data.rows - 1);

            params.last_horizontal_span = params.thumbnail_size * self.data.form_factor_x * (params.last_row_cols-1);

            params.horizontal_scale = d3.scale.linear().domain([0, params.number_cols-1]).range([-self.data.width/2, self.data.width/2]);
            params.vertical_scale = d3.scale.linear().domain([0, self.data.rows-1]).range([params.vertical_span/2, -params.vertical_span/2]);
            params.last_horizontal_scale = d3.scale.linear().domain([0, params.last_row_cols -1]).range([-params.last_horizontal_span/2, params.last_horizontal_span/2]);


            for(var i = 0; i < self.data.rows ; i++ ) {

                console.log("ROW ", i);

                // Not the last row

                if(i !== self.data.rows -1 ){

                    for(var j = 0; j < params.number_cols; j++) {

                        var index = (i*params.number_cols) + j;

                        console.log("COL ", j, index);

                        var thumbnail = self.parsed_data[index];

                        self.insert_a_thumbnail(thumbnail, params, i, j, max_title_length, false);

                    }

                }

                // Last row

                else {

                    for(var j= 0; j < params.last_row_cols; j++){

                        var index = (i*params.number_cols) + j;

                        console.log("COL ", j, index);

                        var thumbnail = self.parsed_data[index];

                        self.insert_a_thumbnail(thumbnail, params, i, j, max_title_length, true);

                    }

                }
            }

            self.el.emit("dv_loaded", null, false);

        }



    },
    remove: function () {

    }
});
