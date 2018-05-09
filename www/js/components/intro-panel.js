
AFRAME.registerComponent('intro-panel', {
    schema: {
        'distance': {type: 'number', default: 3.0},
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
        'close_button_dmms': {type: 'number', default: 40},
        'on_loading_message': {type: 'string', default: "Please wait while scene is loading..."},
        'loaded_message': {type: 'string', default: "Scene loaded!"}
    },
    init: function () {

        var self = this;

        self.constants = {
            dmm: {
                'title': 40,
                'body': 18,
                'credits': 12,
                'loading': 12
            },
            heights:{
                'title': 0.6,
                'body': 0.0,
                'loading': -0.9,
                'credits_heading': -0.50,
                'credits': -0.6
            },
            overlap_factor: 0.95,
            margin: 0.1
        };

        console.log("INIT INTRO PANEL", self.data);

        self.el.setAttribute("class", "intro-panel clickable");

        self.el.setAttribute("rotation", {x: self.data.pitch, y: self.data.yaw, z:0});


    },

    get_count_from_dmms: function(width, dmms, distance){

        return Math.floor((width*1000) / (dmms*distance));

    },

    draw_text: function(){

        var self = this;

        var z_amount = self.data.distance;

        var width = self.width*(1-(self.constants.margin*2));
        var height = (self.height)*(1-(self.constants.margin*2));

        // Title

        self.title = document.createElement("a-text");

        self.title.setAttribute("value", self.data.title);
        self.title.setAttribute("align", "center");
        self.title.setAttribute("width", width);
        self.title.setAttribute("wrap-count", self.get_count_from_dmms(width, z_amount*self.constants.overlap_factor, self.constants.dmm.title));
        self.title.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_color : self.data.text_color);
        self.title.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_title_font : self.data.title_font);
        self.title.setAttribute("position", {x: 0, y: (height/2)*self.constants.heights.title, z: -(z_amount*self.constants.overlap_factor)});


        self.el.appendChild(self.title);

        // Text body

        self.text = document.createElement("a-text");

        self.text.setAttribute("value", self.data.text);
        self.text.setAttribute("align", "center");
        self.text.setAttribute("anchor", "center");
        self.text.setAttribute("width", width);
        self.text.setAttribute("wrap-count", self.get_count_from_dmms(width, z_amount*self.constants.overlap_factor, self.constants.dmm.body));
        self.text.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_color : self.data.text_color);
        self.text.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_font : self.data.text_font);
        self.text.setAttribute("position", {x: 0, y: (height/2)*self.constants.heights.body, z: -(z_amount*self.constants.overlap_factor)});


        self.el.appendChild(self.text);


//        // Credits heading
//
//        self.credits_heading = document.createElement("a-text");
//
//        self.credits_heading.setAttribute("value", "Credits");
//        self.credits_heading.setAttribute("align", "center");
//        self.credits_heading.setAttribute("anchor", "center");
//        self.credits_heading.setAttribute("width", width);
//        self.credits_heading.setAttribute("wrap-count", self.get_count_from_dmms(width, z_amount*self.constants.overlap_factor, self.constants.dmm.credits));
//        self.credits_heading.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_color : self.data.text_color);
//        self.credits_heading.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_font : self.data.text_font);
//        self.credits_heading.setAttribute("position", {x: 0, y: (height/2)*self.constants.heights.credits_heading, z: -(z_amount*self.constants.overlap_factor)});
//
//
//        self.el.appendChild(self.credits_heading);


        // Credits

        self.credits = document.createElement("a-text");

        self.credits.setAttribute("value", self.data.credits);
        self.credits.setAttribute("align", "center");
        self.credits.setAttribute("anchor", "center");
        self.credits.setAttribute("width", width);
        self.credits.setAttribute("wrap-count", self.get_count_from_dmms(width, z_amount*self.constants.overlap_factor, self.constants.dmm.credits));
        self.credits.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_color : self.data.text_color);
        self.credits.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_font : self.data.text_font);
        self.credits.setAttribute("position", {x: 0, y: (height/2)*self.constants.heights.credits, z: -(z_amount*self.constants.overlap_factor)});


        self.el.appendChild(self.credits);


        // Loading


        // Credits

        self.loading = document.createElement("a-text");

        self.loading.setAttribute("value", self.data.on_loading_message);
        self.loading.setAttribute("align", "center");
        self.loading.setAttribute("anchor", "center");
        self.loading.setAttribute("width", width);
        self.loading.setAttribute("wrap-count", self.get_count_from_dmms(width, z_amount*self.constants.overlap_factor, self.constants.dmm.loading));
        self.loading.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_color : self.data.text_color);
        self.loading.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_font : self.data.text_font);
        self.loading.setAttribute("position", {x: 0, y: (height/2)*self.constants.heights.loading, z: -(z_amount*self.constants.overlap_factor)});


        self.el.appendChild(self.loading);




    },

    loaded: function(){

        var self = this;

        var z_amount = self.data.distance;

        var width = self.width*(1-(self.constants.margin*2));
        var height = (self.height)*(1-(self.constants.margin*2));


        // If loaded, remove self.loading and add it again with 'the other message'

        self.loading.parentNode.removeChild(self.loading);

        self.loading = document.createElement("a-text");

        self.loading.setAttribute("value", self.data.loaded_message);
        self.loading.setAttribute("align", "center");
        self.loading.setAttribute("anchor", "center");
        self.loading.setAttribute("width", width);
        self.loading.setAttribute("wrap-count", self.get_count_from_dmms(width, z_amount*self.constants.overlap_factor, self.constants.dmm.loading));
        self.loading.setAttribute("color", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_color : self.data.text_color);
        self.loading.setAttribute("font", self.data.theme ? DATAVERSE.themes[self.data.theme].panel_font : self.data.text_font);
        self.loading.setAttribute("position", {x: 0, y: (height/2)*self.constants.heights.loading, z: -(z_amount*self.constants.overlap_factor)});


        self.el.appendChild(self.loading);


    },

    update: function (oldData) {

        var self = this;

        console.log("UPDATE INTRO PANEL", self.data);

        self.back_panel = document.createElement("a-plane");

        self.height = 2*self.data.distance*Math.tan(THREE.Math.degToRad(self.data.height/2.0));
        self.width = 2*self.data.distance*Math.tan(THREE.Math.degToRad(self.data.coverage/2.0));

        var cam_position = self.el.sceneEl.camera.el.getAttribute("position");

        self.el.setAttribute("position", {x:0, y: cam_position.y, z:0});


        self.back_panel.setAttribute("height", self.height);
        self.back_panel.setAttribute("width", self.width);
        self.back_panel.setAttribute("material", {shader: "flat", color: self.data.theme ? DATAVERSE.themes[self.data.theme].panel_background : self.data.background_color});
        self.back_panel.setAttribute("position", {x: 0, y: 0, z: -self.data.distance});


        self.el.appendChild(self.back_panel);


        // Close button


        var close = document.createElement("a-entity");
        close.setAttribute("uipack-button", {'icon_name': 'times-circle.png', 'radius': self.data.close_button_dmms * self.data.distance / 1000});
        close.setAttribute("position", {x: 0, y: - (self.height/2), z:-self.data.distance*self.constants.overlap_factor});

        var component = self.el;

        close.addEventListener("clicked", function(){

            component.parentNode.removeChild(component);

        });


        self.el.appendChild(close);

        self.draw_text();


    },

    tick: function (time) {

    }
});
