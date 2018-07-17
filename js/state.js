var DATAVERSE = DATAVERSE || {};

DATAVERSE.state = function(options, parent, callback){

    var self = this;

    // Pointer to parent

    self.main = parent;

    self.options = options;

    self.state = {'actual_scene': self.main.urls.get_params().scene ? parseInt(self.main.urls.get_params().scene, 10): 2,
        'scene_history': [],
        'visited_scenes': {}
    };

    self.load_app_data(callback);

};


DATAVERSE.state.prototype = {

    // Load data from spreadsheet

    'load_app_data': function(callback) {

        var self = this;

        var params = self.main.urls.get_params();

        if ('source' in self.main.options) {
            params.source = self.main.options.source;
        }

        self.state.scenes_data_source = params.source;

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

                if ('scenes' in data) {

                    // Insert in DATAVERSE cache

                    DATAVERSE.cache[self.main.options.source] = data;

                    self.state.scenes = tabletop.sheets("scenes").elements;

                    var indexed_scenes = {};

                    // Store home scene for menu interaction

                    self.state.home_scene = 2;

                    self.state.scenes.forEach(function(d,i){

                        indexed_scenes[i+2] = d;

                    });


                    self.state.scenes = indexed_scenes;

                    callback();
                }
                else {

                    self.main.croak("Malformed spreadsheet: No 'scenes' sheet");
                }

            }
        }


    }

};