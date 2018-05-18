var DATAVERSE = DATAVERSE || {};

DATAVERSE.main = function(options) {

    var self = this;

    self.options = options ? options : {};

    console.log('INIT DATAVERSE.main');
    console.log(self.options);


    $(document).ready(function () {

        // Insert interstitial

        var body = document.querySelector("body");

        var interstitial = document.createElement("div");
        interstitial.setAttribute("id", "dataverse-interstitial");
        interstitial.classList.add("dataverse-added");

        body.appendChild(interstitial);

        document.getElementById("dataverse-interstitial").addEventListener("click", function(){

            console.log("INTERSTITIAL CLICK");

            var scene = document.querySelector("a-scene");

            scene.style.display = "block";

            this.parentNode.removeChild(this);

//            var inter = document.getElementById("dataverse-interstitial");
//
//            inter.parentNode.removeChild(inter);

//            console.log("EL THIS", this, this.parentNode, inter, inter.parentNode);

//            this.parentNode.removeChild(this);
//
//            body.removeChild(self.interstitial);

        });


        // Insert loading symbols

        console.log('APP TEST READY!!');

        // Instantiate urls component

        self.urls = new DATAVERSE.urls({}, self);

        console.log('URLS READY');

        // Instantiate renderer

        self.renderer = new DATAVERSE.renderer({}, self);

        console.log('RENDERER READY');

        // Instantiate state

        self.state = new DATAVERSE.state({}, self, function() {

            console.log('STATE READY');

            console.log("ENTRANDO DENTRO DEL MAIN");

            // TEST MODE

            if ('tests' in self.options) {

                // For each test name, run it

                self.options.tests.forEach(function (test_name) {

                    DATAVERSE.tests[test_name](self);

                });

            }
            else {
                console.log("EN EL ELSE DEL MAIN", self.state);

                console.log(self.state.state.scenes);

                // Init scenes

                self.renderer.init_scenes();

                // Go to first scene with false flag (change of scene not coming from the 'back' button)

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

