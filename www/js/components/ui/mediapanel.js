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
        'height': {type: 'number', default: 30.0},
        'text_color': { type: 'string', default: 'black'},
        'aux_color': { type: 'string', default: "white"},
        'text_font': {type: 'string', default: 'roboto'},
        'title_font': {type: 'string', default: 'roboto'},
        'background_color': { type: 'string', default: 'white'},
        'backpanel_color': { type: 'string', default: 'black'},
        'media_url': {type: 'string', default: ""},
        'title': {type: 'string', default: ""},
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

        console.log("LAUNCHING MEDIA PANEL WITH DATA ", self.data);

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
            'link': self.render_link
        };


        self.audio_analyser = {
            width: 1024,
            height: 1024
        };

        self.constants = {
            overlap_factor: 0.99,
            media_dim : 0.90,
            margin: 0.05,
            audio_analyser: {
                width: 1024,
                height: 1024
            },
            dmm: {
                'title': 40,
                'subtitle': 28,
                'body': 18,
                'footnote': 12,
                'link': 20
            },
            heights:{
                'title': 0.8,
                'subtitle': 0.40,
                'body': -0.3,
                'footnote': -0.8
            }
        };

        // Class the element

        self.el.setAttribute("class", "uipack uipack-mediapanel clickable");

        self.el.setAttribute("rotation", {x: self.data.pitch, y: self.data.yaw, z:0});

        // self.el.setAttribute("position", {x:0, y: self.data.elevation, z:0});

        // Get a handle for scene assets

        self.assets = document.querySelector("a-assets");

            if(DATAVERSE_VIZ_AUX.global_tracking.last_media !== undefined){
                DATAVERSE_VIZ_AUX.global_tracking.last_media.pause();

//                        if(self.last_media.tagName === "AUDIO") {
//                            self.context.close();
//                        }

//
                DATAVERSE_VIZ_AUX.global_tracking.last_media = undefined;
            }



//        self.back_panel = <a-curvedimage src="#my-image" height="3.0" radius="5.7" theta-length="72"
//                 rotation="0 100 0" scale="0.8 0.8 0.8"></a-curvedimage>

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

//        console.log(self.dataArray);

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


    draw_text: function() {

        var self = this;

        var z_amount = self.data.distance;

        var width = self.width*(1-(self.constants.margin*2));
        var height = (self.height)*(1-(self.constants.margin*2));

        self.title = document.createElement("a-text");

        self.title.setAttribute("value", self.data.title);
        self.title.setAttribute("align", "center");
        self.title.setAttribute("width", width);
        // console.log("wrapCount", self.get_count_from_dmms(width, z_amount*self.constants.overlap_factor, self.constants.dmm.title));
        self.title.setAttribute("wrap-count", self.get_count_from_dmms(width, z_amount*self.constants.overlap_factor, self.constants.dmm.title));
        self.title.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_color : self.data.text_color);
        self.title.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_title_font : self.data.title_font);
        self.title.setAttribute("position", {x: (self.media_type || self.data.link) ? width/2:0, y: (height/2)*self.constants.heights.title, z: -(z_amount*self.constants.overlap_factor)});


        self.el.appendChild(self.title);

        self.subtitle = document.createElement("a-text");

        self.subtitle.setAttribute("value", self.data.subtitle);
        self.subtitle.setAttribute("align", "center");
        self.subtitle.setAttribute("width", width);
        console.log("wrapCount", self.get_count_from_dmms(width, z_amount*self.constants.overlap_factor, self.constants.dmm.subtitle));
        self.subtitle.setAttribute("wrap-count", self.get_count_from_dmms(width, z_amount*self.constants.overlap_factor, self.constants.dmm.subtitle));
        self.subtitle.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_color : self.data.text_color);
        self.subtitle.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_font : self.data.text_font);
        self.subtitle.setAttribute("position", {x: (self.media_type || self.data.link)? width/2:0, y: (height/2)*self.constants.heights.subtitle, z: -(z_amount*self.constants.overlap_factor)});

        self.el.appendChild(self.subtitle);

        self.text = document.createElement("a-text");

        self.text.setAttribute("value", self.data.text);
        self.text.setAttribute("align", "center");
        self.text.setAttribute("anchor", "center");
        self.text.setAttribute("width", width);
        self.text.setAttribute("wrap-count", self.get_count_from_dmms(width, z_amount*self.constants.overlap_factor, self.constants.dmm.body));
        self.text.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_color : self.data.text_color);
        self.text.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_font : self.data.text_font);
        self.text.setAttribute("position", {x: (self.media_type || self.data.link) ? width/2:0, y: (height/2)*self.constants.heights.body, z: -(z_amount*self.constants.overlap_factor)});


        self.el.appendChild(self.text);


    },

    render_media_texts: function() {

        var self = this;

        var text = self.data.media_caption + self.data.media_credit ? "\nCredits: " + self.data.media_credit : "";

        self.text = document.createElement("a-text");

        self.text.setAttribute("value", text);
        self.text.setAttribute("align", "right");
        self.text.setAttribute("anchor", "right");
        self.text.setAttribute("width", self.width);
        self.text.setAttribute("wrap-count", self.get_count_from_dmms(self.width, self.data.distance*self.constants.overlap_factor, self.constants.dmm.footnote));
        self.text.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_aux_color : self.data.aux_color);
        self.text.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_font : self.data.text_font);
        self.text.setAttribute("position", {x: -self.width/8, y: -self.height/2, z: -(self.data.distance*self.constants.overlap_factor)});

        self.el.appendChild(self.text);


    },

    render_photo: function() {

        var self = this;

        console.log("RENDERING PHOTO");

        var asset_id = "panel_" + self.data.id;


        if(document.getElementById(asset_id) === null) {

            var img_asset = document.createElement("img");

            img_asset.setAttribute("id", asset_id);
            img_asset.setAttribute("src", self.data.media_url);

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

            console.log("LOADED TEXTURE");

            console.log(self.panel_image.object3D.children[0].material.map);

            if(('material' in this.components.material) && ('material' in this.components.material) && (this.components.material.material.map) && ('image' in this.components.material.material.map)) {

                console.log(this.components.material.material.map);


                self.old_offset = this.components.material.material.map.offset;
                self.old_repeat = this.components.material.material.map.repeat;
                self.old_material = this.components.material.material.map;

                this.components.material.material.map.offset = {x:0, y:0};
                this.components.material.material.map.repeat = {x:1.0, y:1.0};
                this.components.material.material.map.needsUpdate = true;


            //
            //     var width = this.components.material.material.map.image.naturalWidth;
            //     var height = this.components.material.material.map.image.naturalHeight;
            //
            //     if (width >= height) {
            //         this.components.material.material.map.repeat = {x: height / width, y: 1};
            //         this.components.material.material.map.offset = {x: (1 - (height / width)) / 2, y: 0.0};
            //     }
            //     else {
            //         this.components.material.material.map.repeat = {x: 1, y: width / height};
            //         this.components.material.material.map.offset = {x: 0.0, y: (1 - (width / height)) / 2};
            //     }
            //
            //     this.components.material.material.map.needsUpdate = true;
            }

        });


        var plane_height = (self.height) * (self.constants.media_dim);

        var plane_width = (self.width) * (self.constants.media_dim);

        var plane_aspect_ratio = plane_width / plane_height;

        // Get image width and height

        var img = document.getElementById(asset_id);

        // Aux closure function to render a panel photo, called from 'img' onload event or directly if image is already loaded

        var render_panel_photo = function(){

                var width = img.naturalWidth;
                var height = img.naturalHeight;

                console.log("NATURAL WIDTH", img.naturalWidth);
                console.log("NATURAL HEIGHT", img.naturalHeight);

                var aspect_ratio = width / height;

                if(aspect_ratio > plane_aspect_ratio){

                    self.panel_image.setAttribute("width", plane_width);

                    self.panel_image.setAttribute("height", plane_width / aspect_ratio);

//                    self.panel.setAttribute("")

                }
                else {

                    self.panel_image.setAttribute("height", plane_height);

                    self.panel_image.setAttribute("width", plane_height * aspect_ratio);

                }

                self.panel_image.setAttribute("position", {x: -self.width/2, y: 0, z: -(self.data.distance*self.constants.overlap_factor)});

                self.panel_image.setAttribute("class", "panel_media");

                self.el.appendChild(self.panel_image);

                self.render_media_texts();

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

        controls.setAttribute("uipack-mediacontrols", {src : "#" + asset_id, size: (self.width/4)});

        controls.setAttribute("class", "panel_media");

        controls.setAttribute("position", {x: -self.width/2 , y: -self.height/2*1.1, z: -(self.data.distance*self.constants.overlap_factor)});

        self.el.appendChild(controls);


    },

    render_link: function(){

        var self = this;

        // Only render things if there's not also media. If media: Render media and link button and text

        if(!(self.media_type)) {


            console.log("RENDERING LINK");

            var asset_id = "panel_" + self.data.id;

            // Variable to annotate if this is a google street view asset

            var gsv = false;


            if (document.getElementById(asset_id) === null) {

                var sv_re = /\s*-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?\s*/i;

                console.log("DATADATA", self.data);

                // console.log("REGEXP",self.data.media_source.search(sv_re));

                if (self.data.link_thumbnail.search(sv_re) !== -1) {

                    gsv = true;

                    var img_asset = document.createElement("img");

                    img_asset.setAttribute("id", asset_id);

                    self.assets.appendChild(img_asset);

                    console.log("LINK TYPE: GSV");

                    var params = self.data.link_thumbnail.trim().split(",");

                    var lat = parseFloat(params[0].trim());

                    var lon = parseFloat(params[1].trim());

                    console.log("LATLONG", lat, lon);

                    // Create a PanoLoader object

                    var loader = new GSVPANO.PanoLoader();

                    loader.setZoom(1);

                    loader.onPanoramaLoad = function () {

                        console.log("ON PANORAMA LOAD");

                        console.log(this.canvas);

                        // var texture = new THREE.Texture(this.canvas);

                        img_asset.src = this.canvas.toDataURL();


                        // if (sky.object3D.children[0].material.map === null) {
                        //     sky.object3D.children[0].material = new THREE.MeshBasicMaterial();
                        //     sky.object3D.children[0].material.map = texture;
                        // }
                        //
                        // texture.needsUpdate = true;


                    };

                    loader.load(new google.maps.LatLng(lat, lon));
                }
                else {

                    var img_asset = document.createElement("img");

                    img_asset.setAttribute("id", asset_id);
                    img_asset.setAttribute("src", self.data.link_thumbnail);

                    self.assets.appendChild(img_asset);
                }


                // dataUrl = canvas.toDataURL(),
                //     imageFoo = document.createElement('img');
                // imageFoo.src = dataUrl;


            }
            else {
                var img_asset = document.getElementById(asset_id);
            }


            self.panel_image = document.createElement("a-plane");


            self.panel_image.setAttribute("src", "#" + asset_id);
            self.panel_image.setAttribute("material", {shader: "flat", repeat: {x: 1, y: 1}, offset: {x: 0, y: 0}});

            // All this is for THREE.js bug that two materials that point to the same image must have the same offset and repeat
            // So this material comes with other offset and repeat if is used the same image outside
            // And thus, when closing the panel, restore the old offset and repeat

            self.panel_image.addEventListener("materialtextureloaded", function () {

                console.log("LOADED TEXTURE");

                console.log(self.panel_image.object3D.children[0].material.map);

                if (('material' in this.components.material) && ('material' in this.components.material) && (this.components.material.material.map) && ('image' in this.components.material.material.map)) {

                    console.log(this.components.material.material.map);


                    self.old_offset = this.components.material.material.map.offset;
                    self.old_repeat = this.components.material.material.map.repeat;
                    self.old_material = this.components.material.material.map;

                    this.components.material.material.map.offset = {x: 0, y: 0};
                    this.components.material.material.map.repeat = {x: 1.0, y: 1.0};
                    this.components.material.material.map.needsUpdate = true;


                }

            });


            var plane_height = (self.height) * (self.constants.media_dim);

            var plane_width = (self.width) * (self.constants.media_dim);

            var plane_aspect_ratio = plane_width / plane_height;

            // Get image width and height

            var img = document.getElementById(asset_id);

            // Aux closure function to render a panel photo, called from 'img' onload event or directly if image is already loaded

            var render_panel_photo = function () {

                var width = img.naturalWidth;
                var height = img.naturalHeight;

                console.log("NATURAL WIDTH", img.naturalWidth);
                console.log("NATURAL HEIGHT", img.naturalHeight);

                var aspect_ratio = width / height;

                if (aspect_ratio > plane_aspect_ratio) {

                    self.panel_image.setAttribute("width", plane_width);

                    self.panel_image.setAttribute("height", plane_width / aspect_ratio);

                    //                    self.panel.setAttribute("")

                }
                else {

                    self.panel_image.setAttribute("height", plane_height);

                    self.panel_image.setAttribute("width", plane_height * aspect_ratio);

                }

                self.panel_image.setAttribute("position", {x: -self.width / 2, y: 0, z: -(self.data.distance * self.constants.overlap_factor)});

                self.panel_image.setAttribute("class", "panel_media");

                self.el.appendChild(self.panel_image);

                // Render button and type of content

                var launch = document.createElement("a-entity");
                launch.setAttribute("uipack-button", {'icon_name': 'arrow-up.png', 'radius': self.data.close_button_dmms * self.data.distance / 1000});
                launch.setAttribute("position", {x: -(self.width / 2), y: -(self.height / 2), z: -self.data.distance * (self.constants.overlap_factor * self.constants.overlap_factor)});

                launch.addEventListener("click", function () {

                    self.el.emit("link", {link: self.data.link}, false);

                });


                self.el.appendChild(launch);

                // Type of content

                self.launch_text = document.createElement("a-text");

                self.launch_text.setAttribute("value", "Go to immersive " + (gsv ? " streetview panorama " : self.data.link_type));
                self.launch_text.setAttribute("align", "center");
                self.launch_text.setAttribute("anchor", "center");
                self.launch_text.setAttribute("width", self.width / 2);
                self.launch_text.setAttribute("wrap-count", self.get_count_from_dmms(self.width / 2, self.data.distance * self.constants.overlap_factor, self.constants.dmm.link));
                self.launch_text.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_aux_color : self.data.aux_color);
                self.launch_text.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_font : self.data.text_font);
                self.launch_text.setAttribute("position", {x: -(self.width / 2), y: -(self.height / 2) - (self.data.close_button_dmms * 2 * self.data.distance / 1000), z: -(self.data.distance * self.constants.overlap_factor)});

                self.el.appendChild(self.launch_text);


                // self.render_media_texts();

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
        // Link and media, media will be rendered by render_media, so just render the button and the text...
        else {

            // Is it a google street view panorama?

            var gsv = false;

            var sv_re = /\s*-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?\s*/i;

            // console.log("REGEXP",self.data.media_source.search(sv_re));

            if (self.data.link_thumbnail.search(sv_re) !== -1) {
                gsv = true;
            }

            // Render button and type of content

            var launch = document.createElement("a-entity");
            launch.setAttribute("uipack-button", {'icon_name': 'arrow-up.png', 'radius': self.data.close_button_dmms * self.data.distance / 1000});
            launch.setAttribute("position", {x: -(self.width / 2), y: -(self.height / 2)*1.5, z: -self.data.distance * (self.constants.overlap_factor * self.constants.overlap_factor)});

            launch.addEventListener("click", function () {

                self.el.emit("link", {link: self.data.link}, false);

            });


            self.el.appendChild(launch);

            // Type of content

            self.launch_text = document.createElement("a-text");

            self.launch_text.setAttribute("value", "Go to immersive " + (gsv ? " streetview panorama " : self.data.link_type));
            self.launch_text.setAttribute("align", "center");
            self.launch_text.setAttribute("anchor", "center");
            self.launch_text.setAttribute("width", self.width / 2);
            self.launch_text.setAttribute("wrap-count", self.get_count_from_dmms(self.width / 2, self.data.distance * self.constants.overlap_factor, self.constants.dmm.link));
            self.launch_text.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_aux_color : self.data.aux_color);
            self.launch_text.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_font : self.data.text_font);
            self.launch_text.setAttribute("position", {x: -(self.width / 2), y: -(self.height / 2)*1.5 - (self.data.close_button_dmms * 2 * self.data.distance / 1000), z: -(self.data.distance * self.constants.overlap_factor)});

            self.el.appendChild(self.launch_text);


        }

    },
    render_audio: function(){

        var self = this;

        var asset_id = "panel_" + self.data.id;

        if(document.getElementById(asset_id) === null) {

            var audio_asset = document.createElement("audio");

            audio_asset.setAttribute("id", asset_id);
            audio_asset.setAttribute("src", self.data.media_url);

            self.assets.appendChild(audio_asset);
        }
        else {
            var audio_asset = document.getElementById(asset_id);
        }

        self.panel_audio = document.createElement("a-plane");

//        self.panel_audio.setAttribute("src", "#" + asset_id);
//
//        self.panel_audio.setAttribute("color", "white");

        var plane_height = (self.height) * (self.constants.media_dim);

        var plane_width = (self.width) * (self.constants.media_dim);

        var plane_aspect_ratio = plane_width / plane_height;

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

//        self.audio_texture = new THREE.Texture(self.audio_canvas);

//        self.panel_audio.setAttribute("src", "#" + audio_canvas_id);
        self.panel_audio.setAttribute("src", "#" + audio_canvas_id);

        self.panel_audio.setAttribute("position", {x: - self.width/2, y: 0, z: -(self.data.distance*self.constants.overlap_factor)});

        self.el.appendChild(self.audio_canvas);

        self.render_media_controls();

        self.render_media_texts();

        audio_asset.play();


    },
    render_video: function(){

        var self = this;

        var asset_id = "panel_" + self.data.id;

        if(document.getElementById(asset_id) === null) {

            var video_asset = document.createElement("video");


            video_asset.setAttribute("id", asset_id);
            video_asset.setAttribute("src", self.data.media_url);

            self.assets.appendChild(video_asset);
        }
        else {
            var video_asset = document.getElementById(asset_id);
        }

        self.panel_video = document.createElement("a-plane");


        self.panel_video.setAttribute("src", "#" + asset_id);

        var plane_height = (self.height) * (self.constants.media_dim);

        var plane_width = (self.width) * (self.constants.media_dim);

        var plane_aspect_ratio = plane_width / plane_height;

        DATAVERSE_VIZ_AUX.global_tracking.last_media = video_asset;

        var render_panel_video = function(){

            console.log("VIDEO DIMENSIONS", video_asset.videoWidth, video_asset.videoHeight);

            var width = video_asset.videoWidth;
            var height = video_asset.videoHeight;

            var aspect_ratio = width/height;

            if(aspect_ratio > plane_aspect_ratio){

                self.panel_video.setAttribute("width", plane_width);

                self.panel_video.setAttribute("height", plane_width / aspect_ratio);

//                    self.panel.setAttribute("")

            }
            else {

                self.panel_video.setAttribute("height", plane_height);

                self.panel_video.setAttribute("width", plane_height * aspect_ratio);

            }

            self.panel_video.setAttribute("material", {src: "#" + asset_id});


//                var real_width = cur * aspect_ratio;

//                self.panel_image.setAttribute("position", "0 " + (self.height/4) + " 0");
//                self.panel_image.setAttribute("position", {x:0, y: self.height/4, z: -(self.data.distance*self.constants.overlap_factor)});
            self.panel_video.setAttribute("position", {x: -self.width/2, y: 0, z: -(self.data.distance*self.constants.overlap_factor)});

            self.panel_video.setAttribute("class", "panel_media");


            self.el.appendChild(self.panel_video);

            self.render_media_controls();

            self.render_media_texts();

//          self.render_media_controls(slide_number, datum, timestamp, tetha_length/2);

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
    update: function () {

        var self = this;

        // Draw back panel

        // What media??

        console.log("GETTING MEDIA", self.data.media_url);

        self.media_type = self.get_media_type(self.data.media_url);

        console.log("MEDIA TYPE", self.media_type);


        self.back_panel = document.createElement("a-plane");

        self.height = 2*self.data.distance*Math.tan(THREE.Math.degToRad(self.data.height/2.0));
        self.width = 2*self.data.distance*Math.tan(THREE.Math.degToRad(self.data.coverage/2.0));


        self.back_panel.setAttribute("height", self.height);
        self.back_panel.setAttribute("width", self.width);
        self.back_panel.setAttribute("material", {shader: "flat", color: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_background : self.data.background_color});
        self.back_panel.setAttribute("position", {x: (self.media_type || self.data.link) ? self.width/2:0, y: 0, z: -self.data.distance});


        self.el.appendChild(self.back_panel);

        if((self.media_type) || (self.data.link)){

            self.background_panel = document.createElement("a-plane");
            self.background_panel.setAttribute("height", self.height*1.1);
            self.background_panel.setAttribute("width", self.width*2.2);
            self.background_panel.setAttribute("material", {shader: "flat", color: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_backpanel: self.data.backpanel_color});
            self.background_panel.setAttribute("position", {x: 0, y: 0, z: -(self.data.distance+0.01)});

            self.el.appendChild(self.background_panel);

        }


        // Close button


        var close = document.createElement("a-entity");
        close.setAttribute("uipack-button", {'icon_name': 'times-circle.png', 'radius': self.data.close_button_dmms * self.data.distance / 1000});
        // close.setAttribute("position", {x: self.media_type? self.width/2:0, y: - (self.height/2), z:-self.data.distance*self.constants.overlap_factor});
        close.setAttribute("position", {x: 0, y: - (self.height/2), z:-self.data.distance*self.constants.overlap_factor});

        close.addEventListener("click", function(){

            // Resolve the 'duplicate image with different offset and repeat THREE.js bug

            if(self.old_material){
                self.old_material.offset = self.old_offset;
                self.old_material.repeat = self.old_repeat;
                self.old_material.needsUpdate = true;
            }


            // Stop old video if any

            if(DATAVERSE_VIZ_AUX.global_tracking.last_media !== undefined){
                DATAVERSE_VIZ_AUX.global_tracking.last_media.pause();

//                        if(self.last_media.tagName === "AUDIO") {
//                            self.context.close();
//                        }

//
//                self.last_media = undefined;
            }


            self.el.parentNode.removeChild(self.el);

        });


        self.el.appendChild(close);

        self.draw_text();

        // bind to self, since it is bound to self.media_renderers object...

        console.log("MEDIA TYPE ", self.media_type);

        if(self.data.link) {
            self.media_renderers["link"].bind(self)();
        }

        if (self.media_type) {

            self.media_renderers[self.media_type].bind(self)();

        }

    },

    remove: function(){

        var self = this;

        console.log("REMOVE");

        self.el = null;

    },

    tick: function () {

        var self = this;

        if((DATAVERSE_VIZ_AUX.global_tracking.last_media !== undefined) && (DATAVERSE_VIZ_AUX.global_tracking.last_media.tagName === "AUDIO")){

            self.render_audio_analyser();

        }

    }
});

