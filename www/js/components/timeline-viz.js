/**
 * Created by Oscar on 11/03/17.
 */


AFRAME.registerSystem('timeline-viz', {

    // Allow line component to accept vertices and color.

    schema: {},

    init: function(){

        var self = this;

        console.log("INICIALIZANDO SYSTEM");

        // Organize render elements by type, each with specific depths offsets and breadth

        self.types = {
            depth: {
                trigger: 0.95,
                legends: 0.90,
                slide_image: 1.0,
                slide_text: 1.0,
                media_controls: 0.9
            },
            vertical_size: {
                slide_image: 3
            },
            height: {
                trigger: 0.25,
                media_controls: 0.60,
                legend_date_explain: -0.01,
                legend_title: -0.15,
                slide_image: 2.5,
                slide_title: 3.8,
                slide_supertitle: 3.5,
                slide_explain: 2.25,
                slide_caption: 0.75,
                slide_credit: 1.10
            },
            // Offset in angles from center of slide
            offset:{
                trigger: 0,
                legends: 0,
                slide_image: 0,
                slide_text: -30,
                slide_caption: 30
            },
            breadth:{
                trigger: 2,
                legends: 5,
                slide_image: 60,
                slide_text: 60
            },
            scales:{
                legend_date_explain: 0.5,
                legend_title: 1.0,
                slide_title: 1.0,
                slide_explain: 0.5
            }
        };

        self.audio_analyser = {
            width: 1024,
            height: 1024
        };

    },

    load_data: function(viz_name, path, tab, callback){

        DATAVERSE_VIZ_AUX.load_data(viz_name, path, tab, callback);

    },
    // Convert dates into javascript native Date format

    arrange_dates: function(datum){

        var self = this;

        var year = null;
        var month = 0;
        var day = 1;
        var hour = 0;
        var minute = 0;
        var second = 0;

        if((datum.year.length > 0) || (typeof datum.year === "number")){

            year = parseInt(datum.year, 10);

            if((datum.month.length > 0) || (typeof datum.month === "number")){

                // Month is zero-based

                month = parseInt(datum.month, 10) -1 ;
            }

            if((datum.day.length > 0) || (typeof datum.day === "number")){
                day = parseInt(datum.day, 10);
            }

            if((datum.time.length > 0) || (typeof datum.time === "number")){
                var time_info = datum.time.split(":");

                hour = time_info[0];
                minute = time_info[1];
                second = time_info[2];
            }

        }

        // TODO: In second phase of this viz, parse here the 'end' date....

        // Year exists at least...

        if(year !== null){
            //https://stackoverflow.com/questions/11526504/minimum-and-maximum-date ===> min date = Tuesday, April 20th, 271,821 BCE

            var begin_date = new Date(year, month, day, hour, minute, second);

            return {'begin': { 'date': begin_date, 'ts': begin_date.getTime()},'end': null};
        }
        else {
            return {'begin': null, 'end': null};
        }

    },

    // Parse media entries in this 'slide'

    arrange_media: function(datum){

        var self = this;

        if(datum.media.length > 2){

            return {'url': datum.media, 'credits': datum['media_credit'], 'caption': datum['media_caption']};

        }

        else{
            return {};
        }

    },
    // prepare a timeline entry from spreadsheet for viz manipulation

    arrange_entry: function(datum){

        var self = this;

        var arranged = {};

        console.log("ARRANGING", datum);

        if(datum.type === "title"){
            arranged.title = datum.headline;
            arranged.text = datum.text;
            arranged.media = self.arrange_media(datum);
            arranged.type = datum.type;
            arranged.group = datum.group;
            arranged.original_datum = datum;
        }
        else {
            arranged.title = datum.headline;
            arranged.text = datum.text;
            arranged.media = self.arrange_media(datum);
            arranged.type = datum.type;
            arranged.group = datum.group;
            arranged.dates = self.arrange_dates(datum);
            arranged.original_datum = datum;
        }

        console.log("ARRANGED", arranged);

        return arranged;


    },
    parse_data: function(data, component_data){

        var self = this;

        self.dates_ts = [];

        // Put final data here and also some viz state. '-1' now_playing indicates 'title'

        var final_data = {
            'title': null,
            'milestones': [
            ],
            now_playing: -1
        };

        // Insert media into assets

        var assets = document.getElementsByTagName("a-assets")[0];


        // Iterate and build structure

        for(var i=0; i < data.length; i++) {

            var datum = data[i];

            console.log("DATUM", datum);

            // Is it a title? => insert in title

            if(datum.type === "title") {

                final_data.title = self.arrange_entry(datum);

                console.log("DEBUG", "INSERTING TITLE ASSET");

            }

            // Else ==> arrange date, and insert into milestones

            else {

                var milestone = self.arrange_entry(datum);

                final_data.milestones.push(milestone);

                // if no begin date, it's not a valid entry, so we discard it

                if(milestone.dates.begin !== null){
                    self.dates_ts.push(milestone.dates.begin.ts);
                }

            }

        }

        // Calculate max-min date

        console.log("DATES ARRAY", self.dates_ts);

        self.min_ts = d3.min(self.dates_ts);
        self.max_ts = d3.max(self.dates_ts);

        // Sort milestones by ts (ascending)

        final_data.milestones.sort(function(a,b) { return a.dates.begin.ts - b.dates.begin.ts});

        return final_data;
    }
});


AFRAME.registerComponent('timeline-viz', {

    // Allow line component to accept vertices and color.

    schema: {
        source: {type: 'string', default: ""},
        tab: {type: 'string', default: ""},
        text_color:  {type: 'string', default: "white"},
        text_font:  {type: 'string', default: "roboto"},
        theme: {'type': 'string', default: "dark"},
        degrees: {type: 'float', default: 220},
        margins: {type: 'float', default: 20},
        legend_height: {type: 'float', default: 2.0},
        legend_dmms: {type: 'float', default: 20},
        sublegend_dmms: {type: 'float', default: 12},
        sublegend_height: {type: 'float', default: 1.0},
        color: {type: 'string', default: "#333355"},
        trigger_color:{type: 'string', default: "black"},
        active_trigger_color: {type: 'string', default: "red"},
        size: {type: 'float', default: 5.0},
        height: {type: 'float', default: 1.1},
        title: {type: 'string', default: ""},
        explain: {type: 'string', default: ""},
        panel_elevation: {type: 'float', default: 2.0},
        panel_height: {type: 'float', default: 30.0}
    },

    init: function () {

        var self = this;

        self.panel_timestamp = Date.now();

        // Load timeline data and 'prepare' it for rendering

        if (self.data.source !== "") {

            this.system.load_data("timeline", self.data.source, self.data.tab, function (data, scene_data) {

                if(data!==null) {

                    self.scene_data = scene_data;

                    self.timeline_data = self.system.parse_data(data, self.data);

                    // Propagate calculated minimum and maximum timestamp from system to component

                    self.max_ts = self.system.max_ts;
                    self.min_ts = self.system.min_ts;

                    // domain is reversed because 'y' rotation is reversed ("not as expected") in a timeline. i.e: Lower degrees to the left

                    self.timeline_scale = d3.scale.linear().domain([self.max_ts, self.min_ts]).range([(self.data.margins/180)*Math.PI, ((self.data.degrees - self.data.margins)/180)*Math.PI]).clamp(true);

//                    self.el.setAttribute("position", "0 " + self.data.height +" 0");

                    self.el.setAttribute("position", {x: self.el.getAttribute("position").x, y: self.data.height, z: self.el.getAttribute("position").z});

                    // Rotate user towards 'half' of the timeline

                    var rotation = self.el.getAttribute("rotation");

                    var y_rotation = (rotation.y + ((-self.data.degrees/2) + 180)) % 360;

                    self.el.setAttribute("rotation", {x: rotation.x, y: y_rotation, z: rotation.z});

                    console.log("Y ROTATION", y_rotation, self.el.getAttribute("rotation"));

                    self.update();


                }
                else {
                    console.error("Could not load data file ", self.data.source);
                    console.log(self.timeline_data);
                }
            });
        }

    },

    // Derive date_explain text from datum

    get_date_explain: function(datum) {

        var self = this;

        // If Display Date is not used in original data (spreadsheet or whatever)

        if(datum.original_datum['display_date'] == "") {
            var moment_date = moment(datum.dates.begin.date);

            console.log("CALCULATING DATE EXPLAIN FOR ", datum, moment_date);


            // Select cases...

            if ((datum.original_datum.day === "") && (datum.original_datum.month === "")) {

                // Only year

                return moment_date.format("Y");

            }
            else {

                // Month + Day + Year

                if ((datum.original_datum.day !== "") && (datum.original_datum.month != "")) {

                    // Month + Day + Year + Time

                    if (datum.original_datum.time !== "") {

                        return moment_date.format("Y/MM/DD HH:mm:ss");

                    }

                    // Month + Day + Year without Time

                    else {

                        return moment_date.format("Y/MM/DD");

                    }

                }
                // Month + Year
                else {
                    if (datum.original_datum.month !== "") {

                        return moment_date.format("Y/MM");
                    }
                }
            }
        }
        else {
            return datum.original_datum['display_date'];
        }




        return "";

    },

    // x,y,z coordinates based on date, and offset theta

    get_coords_and_rotation: function(type, subtype, date_stamp, offset_theta) {

        var self = this;

        // Get depth from type

        var depth = self.system.types.depth[type]* self.data.size;

        var height = self.system.types.height[subtype] * self.data.height;

        // Get tetha from date_stamp and offset_theta (radians)

        var theta = self.timeline_scale(date_stamp);

        console.log("THETA FOR", date_stamp, theta);

        // Return coordinates

        return {
            position: {
                x: depth * Math.sin(theta + THREE.Math.degToRad(offset_theta)),
                y: height,
                z: (depth * Math.cos(theta + THREE.Math.degToRad(offset_theta)))
            },
            rotation: {
                x: 0,
//                y: - THREE.Math.radToDeg(theta) + offset_theta,
//                y: 0,
                y: 180 + THREE.Math.radToDeg(theta) + offset_theta,
                z:0
            }
        }

    },

    // Render timeline cylinder, date marks and milestone marks (TODO: Era marks)

    render_timeline: function() {

        var self = this;

        // Render cylinder

        self.timeline = document.createElement("a-cylinder");

        self.timeline.setAttribute("material", {"color": self.data.theme ? DATAVERSE.themes[self.data.theme].timeline_color : self.data.color, "side": "double"});
        self.timeline.setAttribute("radius", self.data.size);
        self.timeline.setAttribute("height", self.data.height);
        self.timeline.setAttribute("theta-length", self.data.degrees);
        self.timeline.setAttribute("theta-start", 0);
        self.timeline.setAttribute("scale", "1 1 1");
        self.timeline.setAttribute("open-ended", true);

        self.el.appendChild(self.timeline);


        // TODO: Render date marks

        // Render milestone marks

        console.log("MILESTONE MARKS", self);

        self.timeline_data.milestones.forEach(function(datum, i) {

//        for(var i=0; i< self.timeline_data.milestones.length; i++) {

            console.log("RENDERING MILESTONE");

            var datum = self.timeline_data.milestones[i];

            var timestamp = datum.dates.begin.ts;

            // Render explain date

            var explain_date = document.createElement("a-text");

            geom_data = self.get_coords_and_rotation("legends", "legend_date_explain", timestamp, 0);

            explain_date.setAttribute("position", geom_data.position);

            explain_date.setAttribute("rotation", geom_data.rotation);

            var explain_width = (DATAVERSE.dmms.subtitle * (self.data.size) * (self.get_date_explain(datum).length + 4)) / 1000;

            explain_date.setAttribute("value", self.get_date_explain(datum));
            explain_date.setAttribute("align", "center");
            explain_date.setAttribute("width", explain_width);
            explain_date.setAttribute("wrap-count", (self.get_date_explain(datum).length + 4));
            explain_date.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].text_color : self.data.text_color);
            explain_date.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].text_font : self.data.text_font);


            self.el.appendChild(explain_date);


            // Render title

            var title = document.createElement("a-text");

            geom_data = self.get_coords_and_rotation("legends", "legend_title", timestamp, 0);

            console.log("TITLE POSITION", geom_data);

            title.setAttribute("position", geom_data.position);

            title.setAttribute("rotation", geom_data.rotation);

            var title_width = (DATAVERSE.dmms.label * (self.data.size) * (datum.title.length + 4 )) / 1000;

            title.setAttribute("value", datum.title);
            title.setAttribute("align", "center");
            title.setAttribute("width", title_width);
            title.setAttribute("wrap-count", (datum.title.length + 4 ));
            title.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].text_color : self.data.text_color);
            title.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].text_font : self.data.text_font);


            self.el.appendChild(title);


            // Render button

            var geom_data = self.get_coords_and_rotation("trigger", "trigger", timestamp, 0);

            console.log("GEOM DATA", geom_data);

            var more_button = document.createElement("a-entity");

            more_button.setAttribute("uipack-button", {'theme': self.data.theme, icon_name: 'plus.png', radius: (DATAVERSE.dmms.plus_button * self.data.size) / 1000});

            more_button.setAttribute("position", geom_data.position);
            more_button.setAttribute("rotation", geom_data.rotation);

            self.el.appendChild(more_button);


            more_button.addEventListener("clicked", function (event) {


                // Retore trigger as clickable (just in case it is cross-launched)


                if (self.el.sceneEl.restore_clickable) {
                    self.el.sceneEl.restore_clickable.classList.add("clickable");
                }


                // distance between camera and this

                var distance = DATAVERSE_VIZ_AUX.get_distance_xz(self.el.sceneEl.camera.el, this);

                // cam yaw rotation

                var yaw = (self.el.sceneEl.camera.el.getAttribute("rotation").y) % 360;

                // NEW YAW


                var button_pos = this.getAttribute("position");

//                var cam_position = self.el.sceneEl.camera.el.getAttribute("position");

                var new_yaw = DATAVERSE_VIZ_AUX.yaw_pointing_to_object(self.el.sceneEl.camera.el, this);

//
//                console.log("DIFF VECTOR", self.data, button_pos, cam_position, diff_vector, new_yaw, yaw);

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


//                var vertical_offset = distance*Math.tan(THREE.Math.degToRad(self.data.panel_height/2.0)) + self.data.panel_elevation;

//                var vertical_offset = distance*Math.tan(THREE.Math.degToRad(self.data.panel_height/2.0));

                self.media_panel.setAttribute("position", {x: cam_position.x, y:cam_position.y, z: cam_position.z});


                // self.media_panel.setAttribute("position", self.el.sceneEl.camera.el.getAttribute("position"));


                self.media_panel.setAttribute("shadow", {cast: true});

                console.log("DATUM!", datum);

                self.media_panel.classList.add("dataverse-added");

                self.media_panel.setAttribute("uipack-mediapanel", {
                    yaw: new_yaw,
                    low_height: (self.data.height*2.0),
                    theme: self.data.theme,
                    height: self.data.panel_height,
                    distance: distance,
                    title: datum.title,
                    subtitle: self.get_date_explain(datum),
                    text: datum.text,
                    media_url: datum.media.url,
                    media_caption: datum.media.caption,
                    media_credit: datum.media.credits,
                    link: datum.original_datum.link,
                    link_thumbnail: DATAVERSE_VIZ_AUX.get_scene_thumbnail(datum.original_datum.link, self.scene_data),
                    link_type: DATAVERSE_VIZ_AUX.get_scene_type(datum.original_datum.link, self.scene_data),
                    id: "slide_" + i + "_" + self.panel_timestamp
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

        })

    },

    // Create or update geometry

    update: function (oldData) {

        var self = this;

        if((self.timeline_data !== undefined) && (typeof(self.rendered) === "undefined")) {

            // Iterate through objects and titles and delete them

            console.log("DELETING OLD GEOMETRY ...");

            // Regenerating new geometry

            console.log("REGENERATING NEW GEOMETRY ...");

            // Assets pointer

            var assets = document.getElementsByTagName("a-assets")[0];

            self.render_timeline();


            // Render slide -1

            var datum = self.timeline_data.title;

            // distance between camera and this

            var distance = self.data.size;

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

            self.rendered = true;

            self.el.emit("dv_loaded", null, false);

        }
    },

    tick: function(time, timedelta){

        var self = this;

    },

    remove: function () {

    }
});
