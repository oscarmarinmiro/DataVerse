
AFRAME.registerComponent('intro-panel', {
    schema: {
        'distance': {type: 'number', default: 1.5},
        'theme': {type: 'string', default: ""},
        'yaw': { type: 'number', default: 0.0},
        'pitch': { type: 'number', default: 0.0},
        'coverage': {type: 'number', default: 60.0},
        'height': {type: 'number', default: 30.0},
        'text_color': { type: 'string', default: 'black'},
        'text_font': {type: 'string', default: 'roboto'},
        'title_font': {type: 'string', default: 'roboto'},
        'background_color': { type: 'string', default: 'white'},
        'title': {type: 'string', default: ""},
        'text': {type: 'string', default: ""},
        'credits':{type: 'string', default: ""},
        'on_loading_message': {type: 'string', default: "Please wait while scene is loading..."},
        'loaded_message': {type: 'string', default: "Scene loaded!"},
        'loading_gif': {type: 'string', default: "img/loading.gif"}
    },
    init: function () {

        var self = this;

        self.is_loaded = false;

        self.constants = {
            dmm: {
                'title': 40,
                'body': 18,
                'credits': 12,
                'loading': 12,
                'link': 16
            },
            separations: {
                title: 0.2,
                body: 0.0,
                loading: 0.2,
                credits: 0.1
            },
            overlap_factor: 0.99,
            margin: 0.1,
            gif_height: 0.1,
            gif_pos: -0.7
        };

        console.log("INIT INTRO PANEL", self.data);

        self.el.classList.add("intro-panel", "clickable");

        self.el.setAttribute("rotation", {x: self.data.pitch, y: self.data.yaw, z:0});

        // Hide element until reposition

        self.el.setAttribute("visible", false);


    },

    get_count_from_dmms: function(width, dmms, distance){

        return Math.floor((width*1000) / (dmms*distance));

    },

    draw_text: function(){

        var self = this;

        var z_amount = self.data.distance;

        var width = self.width*(1-(self.constants.margin*2));
        var height = (self.height);

        // Title

        self.title = document.createElement("a-entity");

        self.title.setAttribute("text", {
            value: self.data.title,
            align: "center",
            baseline: "top",
            width: width,
            wrapCount: self.get_count_from_dmms(width, z_amount*self.constants.overlap_factor, self.constants.dmm.title),
            color: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_color : self.data.text_color,
            font: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_title_font : self.data.title_font
        });

        var title_y = (height/2) - (height)*self.constants.separations.title;


        self.title.setAttribute("position", {x: 0, y: title_y, z: -(z_amount*self.constants.overlap_factor)});


        self.title.setAttribute("geometry", {primitive: "plane", width: "auto", height: "auto"});
        self.title.setAttribute("material", {shader: "flat", visible: false});

        self.text_panel.appendChild(self.title);

        self.total_height = (height)*self.constants.separations.title;

        self.title.addEventListener("textfontset", function() {

            var title_height = self.title.components.geometry.data.height;

            self.total_height+= title_height + (height) * self.constants.separations.body;

            var body_y = title_y - (height) * self.constants.separations.body - title_height;

            console.log("LOADED TITLE FONT", self.title.components.geometry.data.height, self.title.components);

            // Text body

            self.text = document.createElement("a-entity");

            self.text.setAttribute("text", {
                value: self.data.text,
                align: "center",
                anchor: "center",
                baseline: "top",
                width: width,
                wrapCount: self.get_count_from_dmms(width, z_amount * self.constants.overlap_factor, self.constants.dmm.body),
                color: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_color : self.data.text_color,
                font: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_font : self.data.text_font
            });

            self.text.setAttribute("geometry", {primitive: "plane", width: "auto", height: "auto"});
            self.text.setAttribute("material", {shader: "flat", "visible": false});

            self.text.setAttribute("position", {x: 0, y: body_y, z: -(z_amount * self.constants.overlap_factor)});

            self.text_panel.appendChild(self.text);

            self.text.addEventListener("textfontset", function () {

                console.log("DRAWING CREDITS");

                var body_height = self.text.components.geometry.data.height + (height) * self.constants.separations.credits;

                self.total_height+= body_height + (height) * self.constants.separations.credits;

                var credits_y = body_y - (height) * self.constants.separations.credits - body_height;

                self.credits = document.createElement("a-entity");

                self.credits.setAttribute("text", {
                    value: self.data.credits,
                    align: "center",
                    anchor: "center",
                    baseline: "top",
                    width: width,
                    wrapCount: self.get_count_from_dmms(width, z_amount * self.constants.overlap_factor, self.constants.dmm.credits),
                    color: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_color : self.data.text_color,
                    font: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_font : self.data.text_font
                });

                self.credits.setAttribute("position", {x: 0, y: credits_y, z: -(z_amount * self.constants.overlap_factor)});

                self.credits.setAttribute("geometry", {primitive: "plane", width: "auto", height: "auto"});
                self.credits.setAttribute("material", {shader: "flat", "visible": false});

                self.text_panel.appendChild(self.credits);

                self.credits.addEventListener("textfontset", function () {

                    console.log("DRAWING LOADING");

                    var credits_height = self.credits.components.geometry.data.height;

                    self.total_height+= credits_height + (height) * self.constants.separations.loading;

                    self.loading_position = credits_y - credits_height - (height) * self.constants.separations.loading;

                    self.draw_loading();
                });

            });

        });

    },

    loaded: function(){

        var self = this;

        // Remove gif

        if(self.loading_panel) {

            self.loading_panel.parentNode.removeChild(self.loading_panel);
        }


        self.is_loaded = true;


        // Add button

        self.close = document.createElement("a-entity");
        self.close.setAttribute("uipack-button", {'theme': self.data.theme, 'icon_name': 'arrow-up.png', 'radius': DATAVERSE.dmms.close_button * self.data.distance / 1000});
        self.close.setAttribute("position", {x: 0, y: - (self.height/2), z:-self.data.distance*self.constants.overlap_factor});

        self.close.classList.add("non_click_while_loading");

        var component = self.el;

        self.close.addEventListener("clicked", function(){

            setTimeout(function() {

                component.emit("closed", null, false);

                component.parentNode.removeChild(component);
            }, 100);

        });


        self.el.appendChild(self.close);


        // Add text


        self.loaded_text = document.createElement("a-entity");

        self.loaded_text.setAttribute("text", {
            value: "ENTER THE SCENE",
            align: "center",
            anchor: "center",
            width: self.width*(1-(self.constants.margin*2)) / 2,
            wrapCount: self.get_count_from_dmms(self.width*(1-(self.constants.margin*2)) /2, self.data.distance * self.constants.overlap_factor, self.constants.dmm.link),
            color: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_color : self.data.text_color,
            font: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_title_font : self.data.title_font


        });

        var label_height = ((self.constants.dmm.link * self.data.distance) / 1000)*3;


        self.loaded_text.setAttribute("geometry", {primitive: "plane", width: "auto", height: label_height});
        self.loaded_text.setAttribute("material", {shader: "flat", color: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_background : self.data.background_color});

        self.loaded_text.setAttribute("position", {x: 0, y:  - (self.height/2) - DATAVERSE.dmms.close_button * self.data.distance / 1000 * 2, z: -self.data.distance * self.constants.overlap_factor});

        self.el.appendChild(self.loaded_text);
    },

    // Once all text and loading is drawn, change back_panel height and element positions

    fix_positions: function() {

        var self = this;

        self.old_height = self.height;

//        self.new_height = self.total_height * (1 + (2 * (self.constants.margin)));

        self.new_height_margins = self.total_height * (1 + (2 * (self.constants.margin)));

        self.new_height_margins = self.total_height;

        self.new_height = self.total_height;

        console.log("NEW HEIGHT", self.new_height);

        self.back_panel.setAttribute("height", self.new_height_margins);

        self.offset_y = (self.new_height - self.old_height);

        console.log("OFFSET Y", self.offset_y);

        // Reposition text_panel

        self.text_panel.setAttribute("position",  {x:0, y: self.offset_y/2, z:0});

        self.height = self.new_height_margins;

        if(self.close) {

            self.close.setAttribute("position", {x: 0, y: -(self.height / 2), z: -self.data.distance * self.constants.overlap_factor});
        }

        if(self.loaded_text) {
            self.loaded_text.setAttribute("position", {x: 0, y:  - (self.height/2)  - DATAVERSE.dmms.close_button * self.data.distance / 1000 * 2 , z: -self.data.distance * self.constants.overlap_factor});
        }

        self.el.setAttribute("visible", true);

    },

    // Loading gif painting

    draw_loading : function(){

        var self = this;

        if(!self.is_loaded) {

            self.loading_panel = document.createElement("a-circle");

            self.loading_panel.setAttribute("radius", DATAVERSE.dmms.close_button * self.data.distance / 1000);

            self.loading_panel.setAttribute("position", {x: 0, y: self.loading_position, z: -self.data.distance * self.constants.overlap_factor});

            self.loading_panel.setAttribute("material", {shader: "gif", src: "url(" + (self.data.theme ? DATAVERSE.themes[self.data.theme].loading_gif : self.data.loading_gif) + ")", opacity: 0.75});

            console.log("MATERIAL ATTRIBUTE", self.loading_panel.getAttribute("material"));

            self.text_panel.appendChild(self.loading_panel);
        }

        self.total_height += (DATAVERSE.dmms.close_button * self.data.distance / 1000) * 3;

        self.fix_positions();

    },

    update: function (oldData) {

        var self = this;

        console.log("UPDATE INTRO PANEL", self.data);

        self.back_panel = document.createElement("a-plane");

        self.height = 2*self.data.distance*Math.tan(THREE.Math.degToRad(self.data.height/2.0));
        self.width = 2*self.data.distance*Math.tan(THREE.Math.degToRad(self.data.coverage/2.0));

        var cam_position = self.el.sceneEl.camera.el.getAttribute("position");

        console.log("USER POSITION", cam_position);

        self.el.setAttribute("position", {x:cam_position.x, y: DATAVERSE.height, z:cam_position.z});


        self.back_panel.setAttribute("height", self.height);
        self.back_panel.setAttribute("width", self.width);
        self.back_panel.setAttribute("material", {shader: "flat", color: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_background : self.data.background_color});
        self.back_panel.setAttribute("position", {x: 0, y: 0, z: -self.data.distance});


        self.el.appendChild(self.back_panel);

        self.text_panel = document.createElement("a-entity");

        self.text_panel.setAttribute("position", {x: 0, y: 0, z: 0});

        self.el.appendChild(self.text_panel);

        self.draw_text();


    },

    tick: function (time) {

    }
});
