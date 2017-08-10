var DATAVERSE = DATAVERSE || {};

DATAVERSE.state = function(options, parent, callback){

    var self = this;

    // Pointer to parent

    self.main = parent;

    self.options = options;

    self.state = {};

    self.load_app_data(callback);

};


DATAVERSE.state.prototype = {

    // Load data from spreadsheet

    'load_app_data': function(callback){

        var self = this;

        var params = self.main.urls.get_params();

        console.log("LOS PARAMS SON", params);

        callback();

    },

    // Renders a scene

    'render_scene': function(){

        var self = this;

     }

};