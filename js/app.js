var DATAVERSE = DATAVERSE || {};

DATAVERSE.main = function(options) {

    var self = this;

   // This is to force reload on 'artificially inserted' history entries...

    window.onpopstate = function(event) {
        if(event && event.state) {
            location.reload();
        }
    };

    self.options = options ? options : {};

        self.run_app = function() {

            var self = this;

            self.assets = document.createElement("a-assets");
            self.assets.classList.add("dataverse-added");

            var scene = document.querySelector("a-scene");

            scene.appendChild(self.assets);

//            var img_asset = document.createElement("img");
//
//            img_asset.setAttribute("id", "loading_sheet");
//            img_asset.setAttribute("src", DATAVERSE.paths.loading_thumbnail_static);
//            img_asset.setAttribute('crossorigin', 'anonymous');
//
//            self.assets.appendChild(img_asset);

            // Insert loading symbols

            var loading_defs = [
                [
                    [0, 1.6, -4],
                    [-4, 1.6, 0],
                    [4, 1.6, 0],
                    [0, 1.6, 4]
                ],
                [
                    [0, 0, 0],
                    [0, 90, 0],
                    [0, -90, 0],
                    [0, -180, 0]
                ]
            ];

            for (var i = 0; i < loading_defs[0].length; i++) {

                var loading = document.createElement("a-plane");

                loading.classList.add("dataverse-added");
                loading.setAttribute("position", {x: loading_defs[0][i][0], y: loading_defs[0][i][1], z: loading_defs[0][i][2]});
                loading.setAttribute("rotation", {x: loading_defs[1][i][0], y: loading_defs[1][i][1], z: loading_defs[1][i][2]});
                loading.setAttribute("width", 1);
                loading.setAttribute("height", 1);
                loading.setAttribute("src", DATAVERSE.paths.loading_thumbnail_static);

                document.querySelector("a-scene").appendChild(loading);

                var text = document.createElement("a-text");

                text.classList.add("dataverse-added");
                text.setAttribute("position", {x: loading_defs[0][i][0], y: loading_defs[0][i][1] - 0.75, z: loading_defs[0][i][2]});
                text.setAttribute("rotation", {x: loading_defs[1][i][0], y: loading_defs[1][i][1], z: loading_defs[1][i][2]});
                text.setAttribute("width", 5);
                text.setAttribute("font", "exo2bold");
                text.setAttribute("anchor", "center");
                text.setAttribute("align", "center");
                text.setAttribute("value", "Loading sheet data");

                document.querySelector("a-scene").appendChild(text);


            }

            // Instantiate urls component

            self.urls = new DATAVERSE.urls({}, self);

            // Instantiate renderer

            self.renderer = new DATAVERSE.renderer({}, self);

            // Instantiate state

            self.state = new DATAVERSE.state({}, self, function () {

                // TEST MODE

                if ('tests' in self.options) {

                    // For each test name, run it

                    self.options.tests.forEach(function (test_name) {

                        DATAVERSE.tests[test_name](self);

                    });

                }
                else {

                    // Init scenes

                    self.renderer.init_scenes();

                    // Go to first scene with false flag (change of scene not coming from the 'back' button)

                    self.renderer.render_scene();

                }
            })
        };



    $(document).ready(function () {

        // Insert interstitial

        var scene = document.querySelector("a-scene");

        // Is this embedded?

        console.log("SCENE", scene.getAttribute("embedded"), $("a-scene").css("width"), $("a-scene").css("height"));



        self.interstitial = document.createElement("div");
        self.interstitial.setAttribute("id", "dataverse-interstitial");
        self.interstitial.classList.add("dataverse-added");

        if(scene.getAttribute("embedded")!==null){
            self.interstitial.style.width = $("a-scene").css("width");
            self.interstitial.style.height = $("a-scene").css("height");

        }

        scene.appendChild(self.interstitial);

        self.interstitial_image = document.createElement("div");

        self.interstitial_image.setAttribute("id", "dataverse-interstitial-image");
        self.interstitial_image.classList.add("dataverse-added");

        if(scene.getAttribute("embedded")!==null){
            self.interstitial_image.style.width = $("a-scene").css("width");
            self.interstitial_image.style.height = $("a-scene").css("height");
        }


        scene.appendChild(self.interstitial_image);

        document.getElementById("dataverse-interstitial").addEventListener("click", function (e) {

            var scene = document.querySelector("a-scene");

            scene.style.display = "block";

            this.parentNode.removeChild(this);

            self.interstitial_image.parentNode.removeChild(self.interstitial_image);

            e.stopPropagation();

        });

        document.getElementById("dataverse-interstitial-image").addEventListener("click", function (e) {

            var scene = document.querySelector("a-scene");

            scene.style.display = "block";

            this.parentNode.removeChild(this);

            self.interstitial.parentNode.removeChild(self.interstitial);

            e.stopPropagation();


        });


        self.run_app();

//        var scene = document.querySelector("a-scene");
//
//        if (scene.hasLoaded) {
//          self.run_app();
//        } else {
//          scene.addEventListener('loaded', self.run_app());
//        }


    });

};

DATAVERSE.main.prototype = {

    // Outputs errors

    'croak': function(message){

        console.log("CROAK");
        console.log(message);

        // Insert interstitial

        var body = document.querySelector("body");

        var interstitial = document.createElement("div");
        interstitial.setAttribute("id", "dataverse-interstitial");
        interstitial.classList.add("dataverse-added");

        body.appendChild(interstitial);

        var interstitial_image = document.createElement("div");

        interstitial_image.setAttribute("id", "dataverse-interstitial-image");
        interstitial_image.classList.add("dataverse-added");

        body.appendChild(interstitial_image);


        var interstitial_message = document.createElement("div");

        interstitial_message.setAttribute("id", "dataverse-interstitial-message");
        interstitial_message.classList.add("dataverse-added");

        interstitial_message.innerHTML = "Error => " + message;

        body.appendChild(interstitial_message);


        var scene = document.querySelector("a-scene");

        scene.style.display = "none";


    }
};

