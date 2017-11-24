var DATAVERSE = DATAVERSE || {};

DATAVERSE.state = function(options, parent, callback){

    var self = this;

    // Pointer to parent

    self.main = parent;

    self.options = options;

    self.state = {'actual_scene': self.main.urls.get_params().scene ? parseInt(self.main.urls.get_params().scene, 10): 0, 'scene_history': [] };

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

                if (('links' in data) && ('scenes' in data) && ('labels' in data)) {

                    self.state.scenes = tabletop.sheets("scenes").elements;
                    self.state.links = tabletop.sheets("links").elements;
                    self.state.labels = tabletop.sheets("labels").elements;


                    var indexed_scenes = {};

                    var indexed_links = {};

                    var indexed_labels = {};

                    // Store home scene for menu interaction

                    self.state.home_scene = self.state.scenes[0].number;

                    self.state.scenes.forEach(function(d,i){

                        console.log("SCENE NUMBER ", d,i);

                        indexed_scenes[d.number] = d;

                    });

                    self.state.links.forEach(function(d,i){

                        console.log("LINK NUMBER ", d,i);

                        if(!(d.source in indexed_links)){
                            indexed_links[d.source] = [];
                        }

                        indexed_links[d.source].push(d);

                    });

                    self.state.labels.forEach(function(d,i){

                        if(!(d.scene in indexed_labels)){
                            indexed_labels[d.scene] = [];
                        }

                        indexed_labels[d.scene].push(d);

                    });

                    self.state.scenes = indexed_scenes;
                    self.state.links = indexed_links;
                    self.state.labels = indexed_labels;

                    console.log("SCENES QUEDA", self.state.scenes);
                    console.log("LINKS QUEDA", self.state.links);
                    console.log("LABELS QUEDA", self.state.labels);

                    callback();
                }
                else {

                    self.main.croak("Malformed spreadsheet: No 'links' or 'scenes' sheets");
                }

            }
        }


    }

};