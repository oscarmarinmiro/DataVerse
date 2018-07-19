/**
 * Created by Oscar on 11/03/17.
 */


AFRAME.registerComponent('uipack-mediapanel', {

    // Allow line component to accept vertices and color.

    schema: {
        'id': {type: 'string', default: ""},
        'distance': {type: 'number', default: 3.0},
        'theme': {type: 'string', default: ""},
        'yaw': { type: 'number', default: 0.0},
        'pitch': { type: 'number', default: 0.0},
        'coverage': {type: 'number', default: 60.0},
        'aspect_ratio': {type: 'number', default: (16/9)},
        'height': {type: 'number', default: 30.0},
        'text_color': { type: 'string', default: 'black'},
        'aux_color': { type: 'string', default: "white"},
        'text_font': {type: 'string', default: 'roboto'},
        'title_font': {type: 'string', default: 'roboto'},
        'background_color': { type: 'string', default: 'white'},
        'backpanel_color': { type: 'string', default: 'black'},
        'media_url': {type: 'string', default: ""},
        'title': {type: 'string', default: ""},
        'low_height': {type: 'number', default: -1},
        'subtitle': {type: 'string', default: ""},
        'text': {type: 'string', default: ""},
        'media_caption': {type: 'string', default: ""},
        'media_credit': {type: 'string', default: ""},
        'link': {type: 'string', default: ""},
        'link_thumbnail': {type: 'string', default: ""},
        'link_type': {type: 'string', default: ""},
        'close_button_dmms': {type: 'number', default: 40}
    },

    init: function () {

        var self = this;

        // Initialize media detection regexps

        self.media_detect = {
            'photo': [/\.jpg$/i, /\.jpeg$/i, /\.png$/i],
            'video': [/\.mp4$/i],
            'audio': [/\.mp3$/i]
        };

        self.media_renderers = {
            'photo': self.render_photo,
            'video': self.render_video,
            'audio': self.render_audio,
            'link': self.render_link,
            'text': self.render_text
        };


        self.audio_analyser = {
            width: 1024,
            height: 1024
        };

        self.constants = {
            overlap_factor: 0.99,
            media_dim : 0.90,
            margin: 0.1,
            audio_analyser: {
                width: 1024,
                height: 1024
            },
            dmm: {
                'title': 40,
                'subtitle': 28,
                'body': 18,
                'footnote': 12,
                'link': 16
            },
            heights:{
                'title': 0.8,
                'subtitle': 0.40,
                'body': -0.3,
                'footnote': -0.8
            },
            // This is in % of width
            media_heights: {
                player: 0.085,
                text_box: 0.15

            },
            separations: {
                title: 0.2,
                body: 0.1,
                credits: 0.1
            },
            // This is in % of width from top line of text_box
            media_text_pos: {
                title: 0.35,
                body: 0.15,
                credits: -0.30

            },
            media_text_dmms: {
                title: 16,
                body: 12,
                credits: 8
            }
        };

        // Class the element

        self.el.classList.add("uipack", "uipack-mediapanel", "clickable");

        self.el.setAttribute("rotation", {x: self.data.pitch, y: self.data.yaw, z:0});

        // Get a handle for scene assets

        self.assets = document.querySelector("a-assets");

            if(DATAVERSE_VIZ_AUX.global_tracking.last_media !== undefined){
                DATAVERSE_VIZ_AUX.global_tracking.last_media.pause();

                DATAVERSE_VIZ_AUX.global_tracking.last_media = undefined;
            }

    },

    get_media_type: function(url){

        var self = this;

        // Iterate through all != media types:

        for(var i=0; i<Object.keys(self.media_detect).length; i++){

            var key = Object.keys(self.media_detect)[i];
            var regexps = self.media_detect[key];

            // Iterate through every media type regexp

            for(var j=0; j < regexps.length; j++) {

                if(url.search(regexps[j]) !== -1) {
                    return key;
                }

            }
        }

        return undefined;

    },
    get_count_from_dmms: function(width, dmms, distance){

        return Math.floor((width*1000) / (dmms*distance));

    },

    render_audio_analyser: function(){

        var self = this;

        self.analyser.getByteTimeDomainData(self.dataArray);

        self.audio_context.fillStyle = self.data.theme ? DATAVERSE.themes[self.data.theme].panel_backpanel : self.data.backpanel_color;

        self.audio_context.fillRect(0, 0, self.constants.audio_analyser.width, self.constants.audio_analyser.height);

        self.audio_context.lineWidth = 10;
        self.audio_context.strokeStyle = self.data.theme ? DATAVERSE.themes[self.data.theme].panel_aux_color : self.data.aux_color;

        self.audio_context.beginPath();

        var sliceWidth = self.constants.audio_analyser.width / self.audioBufferLength;

        var x = 0;


        for(var i = 0; i < self.audioBufferLength; i++) {

                var v = self.dataArray[i] / 128.0;
                var y = v * self.constants.audio_analyser.height/2;

                if(i === 0) {
                  self.audio_context.moveTo(x, y);
                } else {
                  self.audio_context.lineTo(x, y);
                }

                x += sliceWidth;
        }

        self.audio_context.lineTo(self.constants.audio_analyser.width, self.constants.audio_analyser.height/2);
        self.audio_context.stroke();

    },


    render_text: function() {

        var self = this;

        self.media_height = 0;
        self.media_control_height = 0;

        self.render_media_texts(true);

    },

    render_media_texts: function(render_link) {

        var self = this;

        self.media_box_offset = (self.media_height/2) + self.media_control_height + (self.width * self.constants.media_heights.text_box/2);

        self.media_box_offset = self.media_box_offset * (1.02);

        self.close_button_y = -self.media_box_offset - (self.width * self.constants.media_heights.text_box/2);

        self.link_button_y = -self.media_box_offset - (self.width * self.constants.media_heights.text_box/2);


        self.media_box_height = self.width * self.constants.media_heights.text_box;

        // Text plane

        self.media_text = document.createElement("a-plane");

        self.media_text.setAttribute("height", self.media_box_height);
        self.media_text.setAttribute("width", self.width);
        self.media_text.setAttribute("material", {shader: "flat", color: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_background : self.data.background_color});
        self.media_text.setAttribute("position", {x: 0, y: -self.media_box_offset, z: -self.data.distance*self.constants.overlap_factor});

        self.el.appendChild(self.media_text);

        self.media_text_container = document.createElement("a-entity");

        self.media_text.appendChild(self.media_text_container);

        // TITLE

        var text = self.data.subtitle ? (self.data.title + " (" + self.data.subtitle + ")") : self.data.title;

        self.title = document.createElement("a-entity");

        self.title.setAttribute("text", {
            value: text,
            align: "left",
            anchor: "left",
            baseline: "top",
            width: self.width * (1 - (self.constants.margin * 2)),
            wrapCount: self.get_count_from_dmms(self.width * (1 - (self.constants.margin * 2)), self.data.distance*self.constants.overlap_factor, self.constants.media_text_dmms.title),
            color: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_color : self.data.color,
            font: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_title_font : self.data.title_font
        });

        self.title.setAttribute("position", {x: -(self.width/2 * (1 - self.constants.margin)) , y: self.media_box_height * (0.5 - self.constants.separations.title), z: 0});

        self.title.setAttribute("geometry", {primitive: "plane", width: "auto", height: "auto"});
        self.title.setAttribute("material", {shader: "flat", "visible": false});

        self.media_text_container.appendChild(self.title);

        self.total_height = (self.media_box_height)*self.constants.separations.title;

        var title_y = self.media_box_height * (0.5 - self.constants.separations.title);

        self.title.addEventListener("textfontset", function(){

            var title_height = self.title.components.geometry.data.height;

            self.total_height+= title_height + (self.total_height) * self.constants.separations.body;

            var body_y = title_y - (self.total_height) * self.constants.separations.body - title_height;


            self.body = document.createElement("a-entity");

            self.body.setAttribute("text", {

                value: self.data.text,
                align: "left",
                anchor: "left",
                baseline: "top",
                width: self.width * (1 - (self.constants.margin)),
                wrapCount: self.get_count_from_dmms(self.width * (1 - (self.constants.margin * 2)), self.data.distance*self.constants.overlap_factor, self.constants.media_text_dmms.body),
                color: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_color : self.data.color,
                font: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_font : self.data.panel_font

            });

            self.body.setAttribute("geometry", {primitive: "plane", width: "auto", height: "auto"});
            self.body.setAttribute("material", {shader: "flat", "visible": false});


            self.body.setAttribute("position", {x: -(self.width/2 * (1 - self.constants.margin)) , y: body_y, z: 0});

            self.media_text_container.appendChild(self.body);


            self.body.addEventListener("textfontset", function () {

                var body_height = self.body.components.geometry.data.height + (self.total_height) * self.constants.separations.credits;

                self.total_height += body_height + (self.total_height) * self.constants.separations.credits;

                var credits_y = body_y - (self.total_height) * self.constants.separations.credits - body_height;

                var text = self.data.media_caption + (self.data.media_credit ? "\nCredits: " + self.data.media_credit : "");

                self.credits = document.createElement("a-entity");

                self.credits.setAttribute("text", {
                    value: text,
                    align: "right",
                    anchor: "right",
                    width: self.width * (1 - (self.constants.margin * 2)),
                    wrapCount: self.get_count_from_dmms(self.width * (1 - (self.constants.margin * 2)), self.data.distance*self.constants.overlap_factor, self.constants.media_text_dmms.credits),
                    color: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_aux_color : self.data.aux_color,
                    font: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_font : self.data.text_font

                });

                self.credits.setAttribute("position", {x:(self.width/2)*(1-(self.constants.margin)) , y: credits_y, z: 0});

                self.credits.setAttribute("geometry", {primitive: "plane", width: "auto", height: "auto"});
                self.credits.setAttribute("material", {shader: "flat", "visible": false});

                self.media_text_container.appendChild(self.credits);

                self.credits.addEventListener("textfontset", function() {

                    var credits_height = self.credits.components.geometry.data.height;

                    self.total_height+= credits_height + (self.data.close_button_dmms * self.data.distance / 1000)/2;

                    self.fix_positions();

                    self.draw_close();

                    if(render_link) {

                        self.render_if_link();
                    }


                });

            });


        });

    },

   fix_positions: function() {

        var self = this;


        self.old_height = self.media_box_height;

        self.new_height_margins = self.total_height;

        self.new_height = self.total_height;

        self.media_text.setAttribute("height", self.new_height_margins);

        self.offset_y = (self.new_height - self.old_height)/2;

        self.media_box_offset+= self.offset_y;

        self.media_text.setAttribute("position", {x: 0, y: -self.media_box_offset, z: -self.data.distance*self.constants.overlap_factor});

        self.media_text_container.setAttribute("position", {x:0, y: self.offset_y, z:0});

        self.close_button_y = -self.media_box_offset - (self.total_height/2);
        self.link_button_y = -self.media_box_offset - (self.total_height/2);


    },

    render_photo: function() {

        var self = this;

        var asset_id = "panel_" + self.data.id;

        if(document.getElementById(asset_id) === null) {

            var img_asset = document.createElement("img");

            img_asset.setAttribute("id", asset_id);
            img_asset.setAttribute("src", self.data.media_url);
            img_asset.setAttribute('crossorigin', 'anonymous');


            self.assets.appendChild(img_asset);

        }
        else {
            var img_asset = document.getElementById(asset_id);
        }


        self.panel_image = document.createElement("a-plane");
        self.panel_image.setAttribute("src", "#" + asset_id);
        self.panel_image.setAttribute("material", {shader: "flat", repeat: {x:1, y:1}, offset: {x:0, y:0}});

        // All this is for THREE.js bug that two materials that point to the same image must have the same offset and repeat
        // So this material comes with other offset and repeat if is used the same image outside
        // And thus, when closing the panel, restore the old offset and repeat

        self.panel_image.addEventListener("materialtextureloaded", function(){

            if(('material' in this.components.material) && ('material' in this.components.material) && (this.components.material.material.map) && ('image' in this.components.material.material.map)) {

                self.old_offset = this.components.material.material.map.offset;
                self.old_repeat = this.components.material.material.map.repeat;
                self.old_material = this.components.material.material.map;

                this.components.material.material.map.offset = {x:0, y:0};
                this.components.material.material.map.repeat = {x:1.0, y:1.0};
                this.components.material.material.map.needsUpdate = true;
            }

        });


        // Get image width and height

        var img = document.getElementById(asset_id);

        // Aux closure function to render a panel photo, called from 'img' onload event or directly if image is already loaded

        var render_panel_photo = function(){

                var width = img.naturalWidth;
                var height = img.naturalHeight;

                var aspect_ratio = (width/height);

                self.media_height = (self.width / aspect_ratio);

                // Width is fixed @ self.width (based on 'coverage). Height is based on width + photo aspect_ratio

                self.panel_image.setAttribute("width", self.width);

                self.panel_image.setAttribute("height", self.media_height);

                self.panel_image.setAttribute("position", {x:0, y: 0, z: -(self.data.distance*self.constants.overlap_factor)});

                self.panel_image.setAttribute("class", "panel_media");

                self.el.appendChild(self.panel_image);

                // No media controls here (for render_media_texts)

                self.media_control_height = 0;

                self.render_media_texts(true);

        };


        // if naturalWidth == 0, image is not loaded. Assets 'loaded' event is not fired (?), so we cannot use that :-(

        if(img.naturalWidth !== 0){

            render_panel_photo();

        }
        else {

            img.onload = function () {

                render_panel_photo();

            };
        }

    },

    render_media_controls: function() {

        var self = this;

        var controls = document.createElement("a-entity");

        var asset_id = "panel_" + self.data.id;

        self.media_control_height = (self.width)* self.constants.media_heights.player;

        controls.setAttribute("uipack-mediacontrols", {src : "#" + asset_id, width: (self.width), height: self.media_control_height, button_radius: self.data.close_button_dmms * self.data.distance / 1000, theme: self.data.theme});

        controls.setAttribute("class", "panel_media");

        controls.setAttribute("position", {x: 0 , y: -(self.media_height/2) - (self.media_control_height/2), z: -(self.data.distance*self.constants.overlap_factor)});

        self.el.appendChild(controls);


    },
    // Only renders link 'arrow'

    render_if_link: function(){

        var self = this;

        if(self.data.link) {

            // Is it a google street view panorama?

            var gsv = false;

            var sv_re = /\s*-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?\s*/i;

            // console.log("REGEXP",self.data.media_source.search(sv_re));

            if (self.data.link_thumbnail.search(sv_re) !== -1) {
                gsv = true;
            }

            // Render button and type of content

            var launch = document.createElement("a-entity");
            launch.setAttribute("uipack-button", {'theme': self.data.theme, 'icon_name': 'arrow-up.png', 'radius': self.data.close_button_dmms * self.data.distance / 1000});
            launch.setAttribute("position", {x: 0, y: self.link_button_y , z: -self.data.distance * (self.constants.overlap_factor * self.constants.overlap_factor)});

            launch.addEventListener("clicked", function () {

                self.el.emit("link", {link: self.data.link}, false);

            });


            self.el.appendChild(launch);

            // Type of content

            self.launch_text = document.createElement("a-entity");

            self.launch_text.setAttribute("text", {

                value: "Go to immersive " + (gsv ? " streetview panorama " : self.data.link_type),
                align: "center",
                anchor: "center",
                width: self.width/2,
                wrapCount: self.get_count_from_dmms(self.width / 2, self.data.distance * self.constants.overlap_factor, self.constants.dmm.link),
                color: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_color : self.data.color,
                font: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_title_font : self.data.title_font

            });

            var label_height = ((self.constants.dmm.link * self.data.distance) / 1000)*3;

            self.launch_text.setAttribute("geometry", {primitive: "plane", height: label_height, width: "auto"});

            self.launch_text.setAttribute("material", {color: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_background : self.data.background_color, shader: "flat"});

            self.launch_text.setAttribute("position", {x: 0, y: (self.link_button_y) - (self.data.close_button_dmms * self.data.distance / 1000)*2, z: -(self.data.distance * self.constants.overlap_factor * self.constants.overlap_factor)});

            self.el.appendChild(self.launch_text);
        }

    },

    render_link: function(){

        var self = this;

        var sv_re = /\s*-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?\s*/i;

        // Only render things if there's not also media. If media: Render media and link button and text

        if(!(self.media_type)) {


            if(self.data.link_thumbnail) {

                var asset_id = "panel_" + self.data.id;

                // Variable to annotate if this is a google street view asset

                var gsv = false;


                if (document.getElementById(asset_id) === null) {


                    if (self.data.link_thumbnail.search(sv_re) !== -1) {

                        gsv = true;

                        var params = self.data.link_thumbnail.trim().split(",");

                        var lat = parseFloat(params[0].trim());

                        var lon = parseFloat(params[1].trim());

                        // Create a PanoLoader object

                        var loader = new GSVPANO.PanoLoader();

                        loader.setZoom(1);

                        loader.onPanoramaLoad = function () {

                        this.canvas.setAttribute("id", asset_id);

                        self.canvas = this.canvas;

                        self.assets.appendChild(this.canvas);

                        self.panel_image = document.createElement("a-plane");

                        var canvas_height = self.canvas.getAttribute("height");
                        var canvas_width = self.canvas.getAttribute("width");


                        self.panel_image.setAttribute("src", "#" + asset_id);
                        self.panel_image.setAttribute("material", {shader: "flat", repeat: {x: 1, y: 1}, offset: {x: 0, y: 0}});

                        var aspect_ratio = canvas_width / canvas_height;

                        self.media_height = self.width / aspect_ratio;

                        self.panel_image.setAttribute("height", self.media_height);

                        self.panel_image.setAttribute("width", self.width);

                        self.panel_image.setAttribute("position", {x: 0, y: 0, z: -(self.data.distance * self.constants.overlap_factor)});

                        self.panel_image.setAttribute("class", "panel_media");

                        self.el.appendChild(self.panel_image);


                        // No media controls here (for render_media_texts)

                        self.media_control_height = 0;

                        self.render_media_texts(true);

                        };

                        loader.load(new google.maps.LatLng(lat, lon));
                    }
                    else {

                        var img_asset = document.createElement("img");

                        img_asset.setAttribute("id", asset_id);
                        img_asset.setAttribute("src", self.data.link_thumbnail);
                        img_asset.setAttribute('crossorigin', 'anonymous');


                        self.assets.appendChild(img_asset);
                    }

                }
                else {

                    var img_asset = document.getElementById(asset_id);

                    // If it's an GSV and asset exists

                    if (self.data.link_thumbnail.search(sv_re) !== -1) {

                        self.canvas = document.getElementById(asset_id);

                        self.panel_image = document.createElement("a-plane");

                        var canvas_height = self.canvas.getAttribute("height");
                        var canvas_width = self.canvas.getAttribute("width");

                        self.panel_image.setAttribute("src", "#" + asset_id);
                        self.panel_image.setAttribute("material", {shader: "flat", repeat: {x: 1, y: 1}, offset: {x: 0, y: 0}});

                        var aspect_ratio = canvas_width / canvas_height;

                        self.media_height = self.width / aspect_ratio;

                        self.panel_image.setAttribute("height", self.media_height);

                        self.panel_image.setAttribute("width", self.width);

                        self.panel_image.setAttribute("position", {x: 0, y: 0, z: -(self.data.distance * self.constants.overlap_factor)});

                        self.panel_image.setAttribute("class", "panel_media");

                        self.el.appendChild(self.panel_image);

                        // No media controls here (for render_media_texts)

                        self.media_control_height = 0;

                        self.render_media_texts(true);

                    }

                }


                // If it's an image (no GSV)
                if (self.data.link_thumbnail.search(sv_re) == -1) {


                    self.panel_image = document.createElement("a-plane");


                    self.panel_image.setAttribute("src", "#" + asset_id);
                    self.panel_image.setAttribute("material", {shader: "flat", repeat: {x: 1, y: 1}, offset: {x: 0, y: 0}});

                    // All this is for THREE.js bug that two materials that point to the same image must have the same offset and repeat
                    // So this material comes with other offset and repeat if is used the same image outside
                    // And thus, when closing the panel, restore the old offset and repeat

                    self.panel_image.addEventListener("materialtextureloaded", function () {

                        if (('material' in this.components.material) && ('material' in this.components.material) && (this.components.material.material.map) && ('image' in this.components.material.material.map)) {

                            self.old_offset = this.components.material.material.map.offset;
                            self.old_repeat = this.components.material.material.map.repeat;
                            self.old_material = this.components.material.material.map;

                            this.components.material.material.map.offset = {x: 0, y: 0};
                            this.components.material.material.map.repeat = {x: 1.0, y: 1.0};
                            this.components.material.material.map.needsUpdate = true;


                        }

                    });


                    // Get image width and height

                    var img = document.getElementById(asset_id);

                    // Aux closure function to render a panel photo, called from 'img' onload event or directly if image is already loaded

                    var render_panel_photo = function () {

                        var width = img.naturalWidth;
                        var height = img.naturalHeight;

                        var aspect_ratio = width / height;

                        self.media_height = self.width / aspect_ratio;

                        self.panel_image.setAttribute("height", self.media_height);

                        self.panel_image.setAttribute("width", self.width);

                        self.panel_image.setAttribute("position", {x: 0, y: 0, z: -(self.data.distance * self.constants.overlap_factor)});

                        self.panel_image.setAttribute("class", "panel_media");

                        self.el.appendChild(self.panel_image);

                        // No media controls here (for render_media_texts)

                        self.media_control_height = 0;

                        self.render_media_texts(true);

                    };


                    // if naturalWidth == 0, image is not loaded. Assets 'loaded' event is not fired (?), so we cannot use that :-(

                    if (img.naturalWidth !== 0) {

                        render_panel_photo();

                    }
                    else {

                        img.onload = function () {

                            render_panel_photo();

                        };
                    }
                }
            }
            else {
                // Link but no thumbnail nor media ====> render_text

                self.media_renderers["text"].bind(self)();
            }
        }

    },
    render_audio: function(){

        var self = this;

        var asset_id = "panel_" + self.data.id;

        if(document.getElementById(asset_id) === null) {

            var audio_asset = document.createElement("audio");

            audio_asset.setAttribute("id", asset_id);
            audio_asset.setAttribute("src", self.data.media_url);
            audio_asset.setAttribute('crossorigin', 'anonymous');


            self.assets.appendChild(audio_asset);
        }
        else {
            var audio_asset = document.getElementById(asset_id);
        }

        self.panel_audio = document.createElement("a-plane");

        var plane_height = (self.width) / self.data.aspect_ratio;

        var plane_width = (self.width);

        self.media_height = plane_height;

        self.panel_audio.setAttribute("width", plane_width);
        self.panel_audio.setAttribute("height", plane_height);
        self.panel_audio.setAttribute("shader", "flat");

        DATAVERSE_VIZ_AUX.global_tracking.last_media = audio_asset;

        self.panel_audio.setAttribute("class", "panel_media");

        self.el.appendChild(self.panel_audio);

        // TEST oscilloscope

        if(DATAVERSE_VIZ_AUX.global_tracking.maps.audio.CONTEXT_MAP.has(audio_asset)){
            var context = DATAVERSE_VIZ_AUX.global_tracking.maps.audio.CONTEXT_MAP.get(audio_asset);
        }
        else {
            var context = new (window.AudioContext || window.webkitAudioContext)();
            DATAVERSE_VIZ_AUX.global_tracking.maps.audio.CONTEXT_MAP.set(audio_asset, context);
        }

        if(DATAVERSE_VIZ_AUX.global_tracking.maps.audio.ANALYSER_MAP.has(audio_asset)){
            var analyser = DATAVERSE_VIZ_AUX.global_tracking.maps.audio.ANALYSER_MAP.get(audio_asset);
        }
        else {
            var analyser = context.createAnalyser();
            analyser.smoothingTimeConstant = 0.3;
            analyser.fftSize = 512;
            DATAVERSE_VIZ_AUX.global_tracking.maps.audio.ANALYSER_MAP.set(audio_asset, analyser);
        }

        if(DATAVERSE_VIZ_AUX.global_tracking.maps.audio.AUDIO_MAP.has(audio_asset)){
            var source = DATAVERSE_VIZ_AUX.global_tracking.maps.audio.AUDIO_MAP.get(audio_asset);
        }
        else {
            var source = context.createMediaElementSource(audio_asset);
            DATAVERSE_VIZ_AUX.global_tracking.maps.audio.AUDIO_MAP.set(audio_asset, source);
            source.connect(analyser);
            analyser.connect(context.destination);

        }

        self.analyser = analyser;

        self.context = context;

        self.audioBufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(self.audioBufferLength);

        self.dataArray = dataArray;

        // Canvas for displaying audio data.

        self.audio_canvas = document.createElement("canvas");
        self.audio_canvas.setAttribute("class", "panel_media");

        var audio_canvas_id = "audio_canvas_" + (new Date() / 1000);

        self.audio_canvas.setAttribute("id", audio_canvas_id);
        self.audio_canvas.width = self.constants.audio_analyser.width;
        self.audio_canvas.height = self.constants.audio_analyser.height;
        self.audio_canvas.style.display = "none";

        self.audio_context = self.audio_canvas.getContext('2d');

        self.panel_audio.setAttribute("src", "#" + audio_canvas_id);

        self.panel_audio.setAttribute("position", {x:0, y: 0, z: -(self.data.distance*self.constants.overlap_factor)});

        self.el.appendChild(self.audio_canvas);

        self.render_media_controls();

        self.render_media_texts(true);

        audio_asset.play();


    },
    render_video: function(){

        var self = this;

        var asset_id = "panel_" + self.data.id;

        if(document.getElementById(asset_id) === null) {


            var video_asset = document.createElement("video");

            video_asset.setAttribute('crossorigin', 'anonymous');
            video_asset.setAttribute("id", asset_id);
            video_asset.setAttribute("src", self.data.media_url);
            video_asset.setAttribute("autoplay", "true");

            self.assets.appendChild(video_asset);

        }
        else {
            var video_asset = document.getElementById(asset_id);
        }

        self.panel_video = document.createElement("a-plane");

            self.panel_video.setAttribute("material", {"src": "#" + asset_id, shader: "flat", repeat: {x: 1, y: 1}, offset: {x: 0, y: 0}});

            self.panel_video.setAttribute("position", {x: 0, y: 0, z: -(self.data.distance*self.constants.overlap_factor)});

            self.panel_video.setAttribute("class", "panel_media");



//        self.panel_video.setAttribute("material", {src: "#" + asset_id});

        DATAVERSE_VIZ_AUX.global_tracking.last_media = video_asset;

        var render_panel_video = function(){

            var width = video_asset.videoWidth;
            var height = video_asset.videoHeight;

            var plane_height = (height/width) * self.width;

            self.media_height = plane_height;

            // panel_video width is fixed and based in mediapanel "coverage" parameter

            self.panel_video.setAttribute("width", self.width);
            self.panel_video.setAttribute("height", plane_height);


            console.log("NEW DEAL");

//            self.panel_video.setAttribute("src", "#" + asset_id);

            self.el.appendChild(self.panel_video);

//            self.render_media_controls();

//            self.render_media_texts(true);

            video_asset.play();

        };

        if(video_asset.videoWidth !== 0){

            render_panel_video();

        }
        else {


            video_asset.addEventListener('loadeddata', function () {

                render_panel_video();

            });
        }

    },

    draw_close: function() {

        var self = this;

       // Close button


        var close = document.createElement("a-entity");
        close.setAttribute("uipack-button", {'theme': self.data.theme, 'icon_name': 'times-circle.png', 'radius': self.data.close_button_dmms * self.data.distance / 1000});
        close.setAttribute("position", {x: 0, y: (self.media_height / 2), z:-(self.data.distance*self.constants.overlap_factor*self.constants.overlap_factor)});
        close.addEventListener("clicked", function(){

            // Resolve the 'duplicate image with different offset and repeat THREE.js bug

            if(self.old_material){
                self.old_material.offset = self.old_offset;
                self.old_material.repeat = self.old_repeat;
                self.old_material.needsUpdate = true;
            }


            // Stop old video if any

            if(DATAVERSE_VIZ_AUX.global_tracking.last_media !== undefined){
                DATAVERSE_VIZ_AUX.global_tracking.last_media.pause();

            }

            // Restore (if applicable) 'trigger' element with removed 'clickable' class

            if(self.el.sceneEl.restore_clickable) {

                self.el.sceneEl.restore_clickable.classList.add("clickable");

            }

            var close_this = function(){

                self.el.parentNode.removeChild(self.el);

            };

            self.el.emit("panel_closed", null, false);

            setTimeout(function(){self.el.parentNode.removeChild(self.el); }, 100);

        });

        self.el.appendChild(close);

        var close_position = self.link_button_y + self.el.getAttribute("position").y;

        if(self.data.low_height !== -1){

            var offset = (self.data.low_height - close_position);

            var position = self.el.getAttribute("position");

            position.y += offset;

            self.el.setAttribute("position", position);
        }


    },
    update: function () {

        var self = this;

        // Draw back panel

        // What media??

        self.media_type = self.get_media_type(self.data.media_url);

        self.back_panel = document.createElement("a-plane");

        self.width = 2*self.data.distance*Math.tan(THREE.Math.degToRad(self.data.coverage/2.0));

        // This is only valid for 'only' text drawing....

        self.height = (self.width / self.data.aspect_ratio);

        // bind to self, since it is bound to self.media_renderers object...

        if(self.data.link) {
            self.media_renderers["link"].bind(self)();
        }

        if (self.media_type) {

            self.media_renderers[self.media_type].bind(self)();

        }

        if(!((self.media_type) || (self.data.link))){

            self.media_renderers["text"].bind(self)();

        }

    },

    remove: function(){

        var self = this;

        self.el = null;

    },

    tick: function () {

        var self = this;

        if((DATAVERSE_VIZ_AUX.global_tracking.last_media !== undefined) && (DATAVERSE_VIZ_AUX.global_tracking.last_media.tagName === "AUDIO")){

            self.render_audio_analyser();

        }

    }
});

