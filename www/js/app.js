var DATAVERSE = DATAVERSE || {};

DATAVERSE.main = function(options) {

    var self = this;

    self.options = options ? options : {};

    console.log('INIT DATAVERSE.main');
    console.log(self.options);

    $(document).ready(function () {

        console.log('APP TEST READY!!');

        // Instantiate urls component

        self.urls = new DATAVERSE.urls({}, self);

        // Instantiate renderer

        self.renderer = new DATAVERSE.renderer({}, self);

        // Instantiate state

        self.state = new DATAVERSE.state({}, self, function() {

            console.log("ENTRANDO DENTRO DEL MAIN");

            // TEST MODE

            if ('tests' in self.options) {

                // For each test name, run it

                self.options.tests.forEach(function (test_name) {

                    DATAVERSE.tests[test_name](self);

                });

            }
            else {
                console.log("EN EL ELSE DEL MAIN");

                console.log(self.state.state.scenes);

                console.log(self.state.state.links);

                // Init scenes

                self.renderer.init_scenes();

                // Go to first scene

                self.renderer.render_scene();

            }
        })
    });

};

DATAVERSE.main.prototype = {

    // Outputs errors (TODO: Show in VR or in a more sophisticated way)

    'croak': function(message){

        console.log("CROAK");
        console.log(message);

    }
};

