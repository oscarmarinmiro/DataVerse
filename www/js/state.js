var DATAVERSE = DATAVERSE || {};

DATAVERSE.state = function(options, parent, callback){

    var self = this;

    // Pointer to parent

    self.main = parent;

    self.options = options;

    self.state = {'actual_scene': self.main.urls.get_params().scene ? self.main.urls.get_params().scene: 0};

    self.load_app_data(callback);

};


DATAVERSE.state.prototype = {

    // Parse data file (TODO: Export to another module)

    'parse_sheets': function(data, tabletop){

//        var self = this;

        console.log("THIS", self);

        if(('links' in data) && ('scenes' in data)) {

            self.state.scenes = data.scenes.elements;
            self.state.links = data.links.elements;

            self.app_callback();

        }
        else {

            self.main.croak("Malformed spreadsheet: No 'links' or 'scenes' sheets");
        }

    },

    // Load data from spreadsheet

    'load_app_data': function(callback) {

        var self = this;

        var params = self.main.urls.get_params();

        console.log("LOS PARAMS SON", params);

        if ('source' in self.main.options) {
            params.source = self.main.options.source;
        }

        if (!('source' in params)) {
            self.main.croak("No source file detected in URL");
        }
        else {

            // Catch network / access errors to spreadsheet. TODO: DOES NOT WORK!!!

            // BEWARE ALSO: https://gist.github.com/jsvine/3295633

            try {
                Tabletop.init({ key: params.source,
                    callback: parse_sheets,
                    simpleSheet: false,
                    parseNumbers: true
                });
            }
            catch (err) {
                self.main.croak("Error accessing spreadsheet: ", err);
            }

            function parse_sheets(data, tabletop) {

                if (('links' in data) && ('scenes' in data)) {

//                self.state.scenes = data.scenes.elements;
//                self.state.links = data.links.elements;

                    self.state.scenes = tabletop.sheets("scenes").elements;
                    self.state.links = tabletop.sheets("links").elements;

                    var indexed_scenes = {};

                    self.state.scenes.forEach(function(d,i){

                        console.log("SCENE NUMBER ", d,i);

                        indexed_scenes[d.number] = d;

                    });

                    self.state.scenes = indexed_scenes;

                    console.log("SCENES QUEDA", self.state.scenes);

                    callback();
                }
                else {

                    self.main.croak("Malformed spreadsheet: No 'links' or 'scenes' sheets");
                }

            }
        }


    }

};