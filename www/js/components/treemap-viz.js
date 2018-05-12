AFRAME.registerComponent('treemap-viz', {

    schema: {
        treemap_data:{
            default: {}
//            parse: function(value) {if(typeof value === 'string'){ return JSON.parse} else { return value;}},
//            stringify: JSON.stringify
        },
        id: {type: 'int', default: 1},
        depth: {type: 'int', default: 1},
        width: {type: 'number', default: 2.0},
        height: {type: 'number', default: 2.0},
        title_max_chars: {type: 'number', default: 30},
        show_numbers: {type: 'boolean', default: false},
        title_x_factor: {type: 'number', default: 1.25},
        title: {type: 'string', default: ""},
        // Just an aux parameter from outside, to calculated legibility of labels, based on dims
        distance: {type: 'number', default: 3.0},
        min_dmms: {type: 'number', default: 8.0},
        buttons: {type: 'boolean', default: true},
        theme: {'type': 'string', default: ""},
        text_color: {type: 'string', default: 'white'},
        text_font: {type: 'string', default: 'roboto'},
        other: {'type': 'boolean', default: false},
        unique_color_scale: {type: 'boolean', default: true},
        general_button_dmms : {type: 'int', default: 20}
    },

    init: function(){

        var self = this;

        console.log("INIT TREEMAP", self.data);

    },
    re_scale: function(value){
        var self = this;

        self.treemap_container.setAttribute("scale", {x:value, y:value, z:value});
    },
    draw_plank: function(datum, padding){

        var self = this;

        // Other is treated differently, since even at depth = 2, important data is at depth = 1. Other is both depth 1 & 2 (they overlap)

        if((datum.depth == self.data.depth) || (self.data.other && (datum.depth === 1))) {

            if((datum.dx > 0) && (datum.dy > 0)) {

                var plank = document.createElement("a-plane");

                //            console.log("DATUM", datum);

                var width = (datum.dx - padding) / 1000;
                var height = (datum.dy - padding) / 1000;

                var name_label = datum.depth == 1 ? datum.name : datum.name + "/" + datum.parent.name;

                var number_label = self.data.show_numbers ? (" (" + DATAVERSE_VIZ_AUX.pretty_print_number(datum.value) + ")") : "";

                name_label += number_label;

                plank.setAttribute("width", width);
                plank.setAttribute("height", height);
                //            plank.setAttribute("color", "white");
                plank.setAttribute("color", datum.depth == 1 ? self.color_scale([datum.name]): self.color_scale([datum.parent.name]));
                //v(d.x+ d.dx/2) - (width/2) + " " + ((d.y+ d.dy/2)-(height/2))
                //            plank.setAttribute("position", {x: (datum.x+ (datum.dx + padding)/2)/1000 + self.data.width/2, y:  (datum.y + (datum.dy - padding) /2)/1000 + self.data.height/2, z: 0});
                plank.setAttribute("position", {x: (datum.x + (datum.dx + padding) / 2) / 1000 - self.data.width / 2, y: (datum.y + (datum.dy - padding) / 2) / 1000 - self.data.height / 2, z: 0});

                self.treemap_container.appendChild(plank);

                var label = document.createElement("a-text");

                label.setAttribute("value", name_label);

                label.setAttribute("align", "center");

                label.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].text_color : self.data.text_color);
                label.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].text_font : self.data.text_font);

                label.setAttribute("position", {x: (datum.x + (datum.dx + padding) / 2) / 1000 - self.data.width / 2, y: (datum.y + (datum.dy - padding) / 2) / 1000 - self.data.height / 2, z: 0});

                if (width >= height) {

                    if (width / height < 7) {

                        var dmms = ((width / (name_label.length + 4)) / (self.data.distance))*1000;

                        if(dmms > self.data.min_dmms) {

                            console.log("DMMS", dmms);

                            label.setAttribute("width", width);

                            label.setAttribute("wrap-count", name_label.length + 4);

                            self.treemap_container.appendChild(label);
                        }

                    }
                }
                else {

                    if (height / width < 7) {

                        var dmms = ((height / (name_label.length + 4)) / (self.data.distance))*1000;

                        if(dmms > self.data.min_dmms) {

                            label.setAttribute("width", height);

                            label.setAttribute("wrap-count", name_label.length + 4);

                            label.setAttribute("rotation", {x: 0, y: 0, z: 90});

                            self.treemap_container.appendChild(label);
                        }

                    }
                }
            }
        }

    },
    update: function (oldData) {

        var self = this;

        // Remove old geometry

        if (self.el.children && self.el.children.length > 0) {

            console.log(self.el.children);

            self.el.children.forEach(function (d) {

                self.el.removeChild(d);

            });
        }

        self.treemap_container = document.createElement("a-entity");

        self.el.appendChild(self.treemap_container);


        // New geometry

        // D3 layout over data

        console.log("TREEMAP DATA", self.data.treemap_data);

        self.color_scale = self.data.unique_color_scale ?  DATAVERSE_VIZ_AUX.color_scale : DATAVERSE_VIZ_AUX.get_color_scale_from_theme(self.data.theme);

        // Padding = 1%

        self.layout = d3.layout.treemap().size([self.data.width*1000,self.data.height*1000]).padding((self.data.width + self.data.height)*5);
//        self.layout = d3.layout.treemap().size([self.data.width*1000,self.data.height*1000]);

        self.nodes = self.layout.nodes(self.data.treemap_data);

//        self.layout({'name': "root", children:[{'name': "test", 'value': 5.0}]});

        console.log("TREEMAP LAYOUT", self.nodes);

        self.nodes.forEach(function(d){

//            self.draw_plank(d,(self.data.width + self.data.height)*2.5);
            self.draw_plank(d,(self.data.width + self.data.height)*2.5);

        });


        self.label = document.createElement("a-text");


        self.label.setAttribute("value", self.data.title);
        self.label.setAttribute("align", "center");
        self.label.setAttribute("width", self.data.width * self.data.title_x_factor);
//        self.label.setAttribute("scale", {x:2.0, y:2.0, z:2.0});
        self.label.setAttribute("wrap-count", self.data.title_max_chars);
//        self.label.setAttribute("baseline", "center");

        self.label.setAttribute("position", {x: 0, y: self.data.height*0.6, z:0});

        self.label.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].text_color : self.data.text_color);
        self.label.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].text_font : self.data.text_font);

        self.el.appendChild(self.label);

        console.log("nodes", self.treemap_data, self.layout);

        if(self.data.buttons) {

            // if data in root: '+' button. Also, zoom button

            var button_row = document.createElement("a-entity");

            button_row.setAttribute("position", {x: 0, y: self.data.height * 0.80, z: 0});


            self.el.appendChild(button_row);

            if (self.data.treemap_data.headline != "") {

                var more_button = document.createElement("a-entity");

                more_button.setAttribute("uipack-button", {'theme': self.data.theme, icon_name: 'plus.png', radius: (self.data.general_button_dmms * self.data.distance) / 1000});

                more_button.setAttribute("position", {x: -(self.data.general_button_dmms * self.data.distance) / 1000, y: 0, z: 0});

                button_row.appendChild(more_button);


                more_button.addEventListener("click", function () {


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

                    var datum = self.data.treemap_data;

                    self.media_panel.setAttribute("uipack-mediapanel", {
                        yaw: yaw,
                        pitch: pitch,
                        theme: self.data.theme,
                        distance: 1.0,
                        title: datum.headline,
                        subtitle: "subtitle",
                        text: datum.text,
                        media_url: datum.media,
                        media_caption: datum.media_caption,
                        media_credit: datum.media_credit,
                        link: datum.link,
                        link_thumbnail: DATAVERSE_VIZ_AUX.get_scene_thumbnail(datum.link, self.scene_data),
                        link_type: DATAVERSE_VIZ_AUX.get_scene_type(datum.link, self.scene_data),
                        id: "treemap_" + self.data.id
                    });

                    self.media_panel.addEventListener("link", function(data){
                        self.el.emit("link", {link: data.detail.link}, false);

                        console.log("LINKANDO A ", data.detail.link);
                    });

                    self.el.sceneEl.appendChild(self.media_panel);

                    self.el.sceneEl.media_panel = self.media_panel;


                });

            }

            var zoom_button = document.createElement("a-entity");

            zoom_button.setAttribute("uipack-button", {'theme': self.data.theme, icon_name: 'search.png', radius: (self.data.general_button_dmms * self.data.distance) / 1000});

            zoom_button.setAttribute("position", {x: self.data.treemap_data.headline != "" ? +(self.data.general_button_dmms * self.data.distance) / 1000 : 0, y: 0, z: 0});

            button_row.appendChild(zoom_button);

            zoom_button.addEventListener("click", function () {

                // parentNode.parentNode is self.el

                console.log("ZOOM BUTTON CLICKED", self.el.parentNode.components["small-treemap-viz"]);

                self.el.parentNode.components['small-treemap-viz'].draw_big_treemap(self.data.id);

            });
        }


    },
    remove: function () {

    }
});


AFRAME.registerSystem('small-treemap-viz', {

    schema: {},

    init: function(){

        var self = this;


    },
     load_data: function(viz_name, path, tab, callback){

        DATAVERSE_VIZ_AUX.load_data(viz_name, path, tab, callback);

    },

    parse_data: function(data, component_data) {

        var self = this;

        console.log("SYSTEM PREPARING DATA", data);

        // Traverse data structures and generate 'N' treemap structures, ready for D3

        var treemaps = [];

        var treemap_counts = [];

        data.forEach(function(d,i) {

            if ((d.treemap.length > 1)) {

                if (!(d.treemap in treemaps)) {

                    treemaps[d.treemap] = {name: "root", children: {}};
                    treemap_counts[d.treemap] = 0.0;

                }

                // If name is root, take rest of the values

                if(d.name === "root"){

                    console.log("ME LLEGA EL ROOT DE ", d.treemap, d);

                    var new_root = d;

                    new_root.children = treemaps[d.treemap].children;

                    treemaps[d.treemap] = new_root;
                }
                else {

                    if (!(d.category in treemaps[d.treemap].children)) {

                        treemaps[d.treemap].children[d.category] = [];
                    }

                    treemaps[d.treemap].children[d.category].push(d);
                    treemap_counts[d.treemap] += d.value;
                }

            }

        });

        console.log("QUEDAN LOS TREEMAPS", treemaps);

        // Sort by total value

        var sorted_treemaps = Object.keys(treemap_counts).sort(function(a,b){return treemap_counts[b] - treemap_counts[a];});

        console.log("SORTED TREEMAPS", treemap_counts, sorted_treemaps, treemaps);

        var category_counts = {};

        function insert_category_counts(treemap, category, count){

            if(!(treemap in category_counts)){
                category_counts[treemap] = {}
            }

            if(!(category in category_counts[treemap])){
                category_counts[treemap][category] = 0.0;
            }

            category_counts[treemap][category]+=count;
        }

        // Now convert object into array. Inserting > max_items into 'Other' (as an object...)

        sorted_treemaps.forEach(function(d,i){

            var treemap = d;

            // If not other, or other treemap + any but last element, or max_items = len of treemaps

            if((i < (component_data.other_treemap ? (component_data.max_items - 1 ) : (component_data.max_items))) || (component_data.max_items == sorted_treemaps.length)) {

                var final_children = [];

                Object.keys(treemaps[treemap].children).forEach(function (datum, j) {

                    var category = datum;

                    var final_children_category = {name: category, children: []};

                    //                console.log("CATEGORY", treemaps[treemap], category);


                    treemaps[treemap].children[category].forEach(function (plank) {

                        final_children_category['children'].push(plank);

                        insert_category_counts(treemap, category, plank.value);

                    });

                    final_children.push(final_children_category);

                });

                treemaps[treemap].children = final_children;
            }
            else {

                if(component_data.other_treemap) {

                    if (!('Other' in treemaps)) {
                        treemaps['Other'] = {'name': 'Other', children: {}};
                    }


                    Object.keys(treemaps[treemap].children).forEach(function (datum, j) {

                        var category = datum;

                        if (!(category in treemaps['Other'].children)) {
                            treemaps['Other'].children[category] = [];
                        }

                        treemaps[treemap].children[category].forEach(function (plank) {

                            treemaps['Other'].children[category].push(plank);

                            insert_category_counts('Other', category, plank.value);

                        });

                    });
                }

                delete treemaps[treemap];

            }


        });

        console.log("CATEGORY COUNTS", category_counts);
        console.log("TREEMAPS", treemaps);


        // Now take every category of every treemap and cap to 'max_items'

        Object.keys(treemaps).forEach(function(treemap){

            var other = {name: 'Other', children: [{name: 'Other', value: 0.0}]};

            var new_children = [];

            if(treemap !== 'Other'){

                console.log("OBJECT KEYS", category_counts[treemap]);

                var sorted_categories = Object.keys(category_counts[treemap]).sort(function(a,b){ return category_counts[treemap][b]  -  category_counts[treemap][a];});

                var not_other_categories = sorted_categories.slice(0, component_data.max_items -1);

                treemaps[treemap].children.forEach(function(d,i){

                    // If in not_other categories, leave alone. If not present, annotate children in 'Other'

                    if(not_other_categories.indexOf(d.name) == -1){

                        d.children.forEach(function(d,i){

                            console.log("sumando a other", d.value, d);

                            other.children[0].value += d.value;

                            console.log("other queda", other.children);

                        });

                    }
                    else {
                        new_children.push(d);
                        console.log("PUSHING CHILDREN", d);
                    }

                });

                console.log("ANTES DE PUSH DE OTHER", other);
                new_children.push(other);
                treemaps[treemap].children = new_children;

            }
            else {

                // 'Other' treemap

                var other_count = 0;

                var sorted_categories = Object.keys(category_counts[treemap]).sort(function(a,b){ return category_counts[treemap][b]  -  category_counts[treemap][a];});

                var not_other_categories = sorted_categories.slice(0, component_data.max_items -1);

                Object.keys(category_counts[treemap]).forEach(function(d,i){

                    if(not_other_categories.indexOf(d) == -1){

                        other.children[0].value += category_counts[treemap][d];

                    }
                    else {
                        var a_children = {'name':d , value: category_counts[treemap][d], children:{name: d, value: category_counts[treemap][d]}};
                        console.log("A CHILDREN", a_children);
                        new_children.push({'name':d , value: category_counts[treemap][d], children:{name: d, value: category_counts[treemap][d]}});
                    }

                    other_count += category_counts[treemap][d];

                });

                console.log("NEW CHILDREN", new_children);

                new_children.push(other);
                treemaps[treemap].children = new_children;

                treemap_counts['Other'] = other_count;

                console.log("OTHER COUNT", other_count);

            }



        });


        console.log("LOS TREEMAPS QUEDAN", treemaps, treemap_counts);

        // Recalculate sorted_treemaps taking into account the 'Other' entry just creates

        var sorted = Object.keys(treemap_counts).sort(function(a,b) { return treemap_counts[b] - treemap_counts[a]}).slice(0, component_data.max_items);

        var new_treemap_counts = {};

        sorted.forEach(function(name){
            new_treemap_counts[name] = treemap_counts[name];

        });

        console.log("TREEMAP COUNTS SORTED", sorted);

        return {data: treemaps, treemap_counts: new_treemap_counts};

    }
});


AFRAME.registerComponent('small-treemap-viz', {

    schema: {
        source: {type: 'string', default: ""},
        tab: {type: 'string', default: ""},
        width: {type: 'float', default: 5.0},
        rows: {type: 'int', default: 3},
        depth: {type: 'int', default: 2},
        show_numbers: {type: 'boolean', default: false},
        max_items: {type: 'int', default: 9},
        distance: {type: 'float', default: 3.0},
        theme: {'type': 'string', default: ""},
        text_color: {type: 'string', default: 'white'},
        text_font: {type: 'string', default: 'roboto'},
        unique_color_scale: {type: 'boolean', default: true},
        form_factor_x: {type: 'float', default: 1.25},
        form_factor_y: {type: 'float', default: 1.5},
        other_treemap: {type: 'boolean', default: true},
        general_text_dmms : {type: 'int', default: 30},
        general_button_dmms : {type: 'int', default: 20}

    },

    init: function () {

        var self = this;

        console.log("INIT SMALL TREEMAP COMPONENT", self.data);

        if (self.data.source !== "") {

            this.system.load_data("treemap", self.data.source, self.data.tab, function (data, scene_data) {

                if (data !== null) {

                    self.scene_data = scene_data;

                    self.parsed_data = self.system.parse_data(data, self.data);

//                    self.parsed_data_deepcopy = JSON.parse(JSON.stringify(self.parsed_data));

                    self.parsed_data_deepcopy = jQuery.extend(true, {}, self.parsed_data);

                    console.log("PARSED DATA", self.parsed_data);

                    // Call explicitly since first update lags in data

                    self.update();


                }
            });
        }


    },

    draw_big_treemap :function(index){

        var self = this;

        var name = self.treemap_list[index];
        var treemap = jQuery.extend(true, {}, self.parsed_data_deepcopy.data[name]);

        console.log("DRAWING BIG TREEMAP FOR index ", index, name, self.parsed_data_deepcopy, treemap);

        self.big_treemap_background = document.createElement("a-plane");

        self.big_treemap_background.setAttribute("width", self.data.width/2);
        self.big_treemap_background.setAttribute("height", self.data.width/2);
        self.big_treemap_background.setAttribute("color", "black");
        self.big_treemap_background.setAttribute("position", {x:0, y:0, z: -(self.data.distance*1.01/2)});

        self.el.appendChild(self.big_treemap_background);


        var treemap_component = document.createElement("a-entity");

        treemap_component.setAttribute("treemap-viz", {treemap_data: treemap, theme: self.data.theme, unique_color_scale: self.data.unique_color_scale, other: name === "Other", title: name, width: self.data.width/2,
                                                        height: self.data.width/2, title_max_chars: name.length + 4,
                                                        title_x_factor: self.data.form_factor_x,
                                                        distance: self.data.distance/2,
                                                        buttons: false, depth: self.data.depth, show_numbers: self.data.show_numbers,
                                                        text_color: self.text_color,
                                                        text_font: self.text_font

        });
        treemap_component.setAttribute("position", {x:0, y:0, z: -(self.data.distance/2)});

        self.big_treemap = treemap_component;

        self.el.appendChild(treemap_component);

        self.close_button = document.createElement("a-entity");

        self.close_button.setAttribute("uipack-button", {'theme': self.data.theme, icon_name: 'times.png', radius: (self.data.general_button_dmms * (self.data.distance)) / 1000});

        self.close_button.setAttribute("position", {x: -(self.data.width/4) * 1.3, y: 0, z: -self.data.distance/2});

        self.el.appendChild(self.close_button);

        self.close_button.addEventListener("click", function(){

            self.el.removeChild(self.big_treemap);

            self.el.removeChild(self.close_button);

            self.el.removeChild(self.big_treemap_background);

        });



    },

    update: function (oldData) {

        var self = this;


        if(self.parsed_data && self.parsed_data_deepcopy && typeof self.treemaps === "undefined") {

            console.log("UPDATE SMALL TREEMAP COMPONENT", self.data);

            console.log("REMOVING OLD GEOMETRY...");

            if (self.el.children && self.el.children.length > 0) {

                console.log(self.el.children);

                for(var i=0; i < self.el.children.length; i++) {

//                    self.el.children.forEach(function (d) {
//
//                        self.el.removeChild(d);
//
//                    });

                    self.el.removeChild(self.el.children[i]);
                }
            }

            // One treemap per keyword in self.prepared_data

            console.log("PARSED DATA", self.parsed_data);

            // Move parent entity to eye level

            self.el.setAttribute("position", {x: 0, y: self.el.sceneEl.camera.el.getAttribute("position").y, z:0});


            // Store scale

            DATAVERSE_VIZ_AUX.color_scale = DATAVERSE_VIZ_AUX.get_color_scale_from_theme(self.data.theme);

            // Get max length of treemap titles

            var max_title_length = Object.keys(self.parsed_data.treemap_counts).sort(function(a,b) { return b.length - a.length;})[0].length;

            console.log("MAX TITLE LENGTH", max_title_length);

            // Arrange treemaps and insert them

            var params = {};

            params.treemap_list = Object.keys(self.parsed_data.treemap_counts).sort(function(a,b) { return self.parsed_data.treemap_counts[b] - self.parsed_data.treemap_counts[a];});

            self.treemap_list = params.treemap_list;

            params.treemap_number = params.treemap_list.length;

            params.number_cols = Math.ceil(params.treemap_number / self.data.rows);

            params.last_row_cols = params.treemap_number - ((self.data.rows-1) * params.number_cols);

            params.treemap_size = self.data.width / ((params.number_cols-1) * self.data.form_factor_x);

            params.vertical_span = params.treemap_size * self.data.form_factor_y * (self.data.rows - 1);

            params.last_horizontal_span = params.treemap_size * self.data.form_factor_x * (params.last_row_cols-1);

            params.horizontal_scale = d3.scale.linear().domain([0, params.number_cols-1]).range([-self.data.width/2, self.data.width/2]);
            params.vertical_scale = d3.scale.linear().domain([0, self.data.rows-1]).range([params.vertical_span/2, -params.vertical_span/2]);
            params.last_horizontal_scale = d3.scale.linear().domain([0, params.last_row_cols -1]).range([-params.last_horizontal_span/2, params.last_horizontal_span/2]);


            console.log("LAST HOR", params.last_horizontal_scale.range(), params.last_horizontal_scale.domain());

            console.log("PARAMS", params);

            self.treemaps = [];

            self.value_treemaps = [];

            for(var i = 0; i < self.data.rows ; i++ ) {

                console.log("ROW ", i);

                // Not the last row

                if(i !== self.data.rows -1 ){

                    for(var j = 0; j < params.number_cols; j++) {

                        var index = (i*params.number_cols) + j;

                        console.log("COL ", j, index);

                        var name = params.treemap_list[index];
                        var treemap = self.parsed_data.data[name];

//                        var theta = THREE.Math.mapLinear(j, 0, params.number_cols -1 , -self.data.angular_width/2, self.data.angular_width/2);

                        var position = {x: params.horizontal_scale(j), y: params.vertical_scale(i), z: -self.data.distance};


                        var treemap_component = document.createElement("a-entity");

                        treemap_component.setAttribute("treemap-viz", {treemap_data: treemap, theme: self.data.theme, unique_color_scale: self.data.unique_color_scale, title: name, width: params.treemap_size,
                                                                        height: params.treemap_size, title_max_chars: max_title_length,
                                                                        title_x_factor: self.data.form_factor_x, distance: self.data.distance, id: index,
                                                                        text_color: self.text_color,
                                                                        text_font: self.text_font

                        });
                        treemap_component.setAttribute("position", position);

                        self.el.appendChild(treemap_component);

                        self.treemaps.push(treemap_component);

                        self.value_treemaps.push(self.parsed_data.treemap_counts[name]);



                    }

                }

                // Last row

                else {

                    for(var j= 0; j < params.last_row_cols; j++){

                        var index = (i*params.number_cols) + j;

                        console.log("COL ", j, index);

                        var name = params.treemap_list[index];
                        var treemap = self.parsed_data.data[name];

//                        var theta = THREE.Math.mapLinear(j, 0, params.number_cols -1 , -self.data.angular_width/2, self.data.angular_width/2);

                        var position = {x: params.last_horizontal_scale(j), y: params.vertical_scale(i), z: -self.data.distance};


                        var treemap_component = document.createElement("a-entity");

                        treemap_component.setAttribute("treemap-viz", {treemap_data: treemap, theme: self.data.theme, unique_color_scale: self.data.unique_color_scale, title: name, width: params.treemap_size,
                                                                        height: params.treemap_size, title_max_chars: max_title_length,
                                                                        title_x_factor: self.data.form_factor_x, distance: self.data.distance, id: index,
                                                                        text_color: self.text_color,
                                                                        text_font: self.text_font

                        });
                        treemap_component.setAttribute("position", position);

                        self.el.appendChild(treemap_component);

                        self.treemaps.push(treemap_component);

                        self.value_treemaps.push(self.parsed_data.treemap_counts[name]);

                    }

                }
            }


            // Proportional sizes text and button

            var propor_text = document.createElement("a-text");

            var text = "See proportional sizes";

            var width = (self.data.general_text_dmms * self.data.distance * (text.length)) / 1000;


            propor_text.setAttribute("value", text);
            propor_text.setAttribute("align", "center");
            propor_text.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].text_color : self.data.text_color);
            propor_text.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].text_font : self.data.text_font);
            propor_text.setAttribute("wrapCount", text.length);
            propor_text.setAttribute("width", width);
            propor_text.setAttribute("position", {x:0, y: params.vertical_scale(self.data.rows-0.5), z: -self.data.distance});

            self.el.appendChild(propor_text);

            // button

            var propor_button = document.createElement("a-entity");
            propor_button.setAttribute("uipack-button", {'theme': self.data.theme, icon_name: "toggle-off.png", radius: (self.data.general_button_dmms * self.data.distance) / 1000});
            propor_button.setAttribute("position", {x: -width*0.3, y: params.vertical_scale(self.data.rows - 0.5), z: -self.data.distance});

            self.el.appendChild(propor_button);

            self.proportional = false;

            propor_button.addEventListener("click", function(){

                console.log("CLICK");

                self.proportional = !self.proportional;

                if(self.proportional){
                    propor_button.setAttribute("uipack-button", {'theme': self.data.theme, icon_name: "toggle-on.png", radius: (self.data.general_button_dmms * self.data.distance) / 1000});

                    self.treemaps.forEach(function(d,i){

                        var scale = Math.sqrt(d.components["treemap-viz"].data.treemap_data.value / d3.max(self.value_treemaps));

//                        console.log(d.components["treemap-viz"], d.components["treemap-viz"].data.treemap_data, d.components["treemap-viz"].data.treemap_data.value, scale, self.value_treemaps, self.parsed_data.treemap_counts);

                        d.components["treemap-viz"].re_scale(scale);

                    });
                }
                else {
                    propor_button.setAttribute("uipack-button", {'theme': self.data.theme, icon_name: "toggle-off.png", radius: (self.data.general_button_dmms * self.data.distance) / 1000});

                    self.treemaps.forEach(function(d,i){

                        d.components["treemap-viz"].re_scale(1.0);

                    });

                }


            });


            self.el.emit("dv_loaded", null, false);


        }



    },
    remove: function () {

    }
});
