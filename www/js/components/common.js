DATAVERSE_VIZ_AUX = {
    'color_scale': null,
    'gsv_quality': 4,
    'global_tracking': {
        'last_media': undefined,
        'maps': {
           'audio': {
               AUDIO_MAP: new WeakMap(),
               CONTEXT_MAP: new WeakMap(),
               ANALYSER_MAP: new WeakMap()
           }
        }
    },
    'non_theme_defaults':{
        'color_scale': 'category20',
        'default_color': 'black',
        'cursor_color': 'yellow',
        'floor': 'black',
        'sky': 'black',
        'icon_path': 'icons'

    },
    'isInt': function(n) {
        return n %1 === 0;
    },
    'pretty_print_number': function(number){
        var self = this;

        // Return int or float capped to 2 decimals

        if(self.isInt(number)){
            return number;
        }
        else {
            return number.toFixed(2);
        }

    },
    'return_color_scale_from_data': function(scale_name){

        var self = this;

        if(scale_name instanceof Array){
            return d3.scale.ordinal().range(scale_name);
        }
        else {
            return d3.scale[scale_name]();
        }

    },
    'get_default_color_from_theme': function(theme_name){

        var self = this;

        // If theme_name != "" call is from dataverse, else use non_theme_defaults

        if(theme_name !== ""){

            return DATAVERSE.themes[theme_name]['default_color'];
        }
        else {
            return self.non_theme_defaults['default_color'];
        }

    },
    'get_color_scale_from_theme': function(theme_name){

        var self = this;
        
        if(theme_name !== ""){

            return self.return_color_scale_from_data(DATAVERSE.themes[theme_name]['color_scale']);

        }
        else {
            return self.return_color_scale_from_data(self.non_theme_defaults.color_scale);
        }

    },
    'get_scene_type': function(link, gs_data){
       var self = this;

       if(typeof(link) !== "undefined") {
           if (link !== "") {

               try {

                   // Subtract 1 b/c 0-based indexing and another one b/c of header

                   var link_number = parseInt(link, 10) - 2;

                   var entry = gs_data.scenes.elements[link_number];

                   if (entry.type === "photo-viz") {
                       return "photo"
                   }
                   else {
                       if (entry.type === "video-viz") {
                           return "video"
                       }
                       else {
                           return "viz";
                       }
                   }
               }
               catch (err) {
                   console.error("ERROR GETTING SCENE THUMBNAIL IN ", link, gs_data, err.mesage);
               }
           }
           else {
               return "";
           }
       }
       else {
           return "";
       }

    },
    'get_scene_thumbnail': function(link, gs_data) {

       var self = this;


//       console.log("GST ", link, typeof(link), link!=="", parseInt(link, 10) - 2, gs_data);

       if(typeof(link) !== "undefined") {
           if (link !== "") {

               try {

                   // Subtract 1 b/c 0-based indexing and another one b/c of header

                   var link_number = parseInt(link, 10) - 2;

                   var entry = gs_data.scenes.elements[link_number];

                   if (entry.thumbnail) {
                       return entry.thumbnail;
                   }
                   else {
                       if (entry.media_source) {

                           // If not thumbnail, and video or photo, return DATAVERSE thumbnail

                           if(entry.type === "video-viz"){
                               return DATAVERSE.paths.video_thumbnail;
                           }
                           else {
                               if (entry.type === "photo-viz") {

                                    var sv_re = /\s*-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?\s*/i;

                                   // But if Google Street View, then return media source and thus a snapshot can be rendered

                                   if(entry.media_source.search(sv_re) !== -1){
                                       return entry.media_source;
                                   }
                                   else {
                                       return DATAVERSE.paths.photo_thumbnail;
                                   }
                               }
                           }
                       }
                       else {
                           return DATAVERSE.paths.viz_thumbnail;
                       }
                   }
               }
               catch (err) {
                   console.error("ERROR GETTING SCENE THUMBNAIL IN ", link, gs_data, err.mesage);
               }
           }
           else {
               return "";
           }
       }
       else {
           return "";
       }

   },
  'get_distance': function(el_one, el_two) {

        var el_one_position = new THREE.Vector3();

        el_one_position.setFromMatrixPosition(el_one.object3D.matrixWorld);

        var el_two_position = new THREE.Vector3();

        el_two_position.setFromMatrixPosition(el_two.object3D.matrixWorld);

        return new THREE.Vector3(el_one_position.x, el_one_position.y, el_one_position.z).distanceTo(new THREE.Vector3(el_two_position.x, el_two_position.y, el_two_position.z));
  },
  'get_distance_xz': function(el_one, el_two) {

        var el_one_position = new THREE.Vector3();

        el_one_position.setFromMatrixPosition(el_one.object3D.matrixWorld);

        el_one_position.setY(0);

        var el_two_position = new THREE.Vector3();

        el_two_position.setFromMatrixPosition(el_two.object3D.matrixWorld);

        el_two_position.setY(0);

        return new THREE.Vector3(el_one_position.x, el_one_position.y, el_one_position.z).distanceTo(new THREE.Vector3(el_two_position.x, el_two_position.y, el_two_position.z));
  },
  'yaw_pointing_to_object': function (camera, object){

      var cam_position = new THREE.Vector3();

      cam_position.setFromMatrixPosition(camera.object3D.matrixWorld);

      cam_position.setY(0);

      var object_position = new THREE.Vector3();

      object_position.setFromMatrixPosition(object.object3D.matrixWorld);

      object_position.setY(0);

      var pointing = object_position.sub(cam_position);

      var angle = (Math.atan2(-pointing.z, pointing.x)*THREE.Math.RAD2DEG) -  90;

      return angle;


  },
  'cam_destination_to_object': function(camera, object, distance){

      var cam_position = new THREE.Vector3();

      cam_position.setFromMatrixPosition(camera.object3D.matrixWorld);

      cam_position.setY(0);

      var object_position = new THREE.Vector3();

      object_position.setFromMatrixPosition(object.object3D.matrixWorld);

      object_position.setY(0);

      var lerp_alpha = (cam_position.distanceTo(object_position) - distance) / cam_position.distanceTo(object_position);

      lerp_alpha = lerp_alpha < 0 ? 0 : lerp_alpha;

      var final_vector = cam_position.lerp(object_position, lerp_alpha).setY(camera.getAttribute("position").y);

      return final_vector;

  },
  'load_data': function(viz_name, path, tab, callback) {

      var self = this;

//      console.log("SYSTEM LOADING DATA", path);

      // remote csv file

      if (path.endsWith(".csv")) {

//          console.log("ITS A CSV");

          d3.csv(path, function (data) {

//              console.log("LOADED CSV DATA", data);

              if (callback) callback(data);

          });
      }

      // if google spreadsheet, use tabletop to parse data

      else if (path.includes("docs.google.com")) {

//          console.log("ITS A GSHEET");

          if (tab) {

              if (typeof DATAVERSE !== 'undefined' && DATAVERSE !== null) {

                  if (('cache' in DATAVERSE) && (path in DATAVERSE.cache)) {

//                      console.log("DEVUELVO EL ELEMENTO CACHEADO");

                      callback(DATAVERSE.cache[path][tab]['elements'], DATAVERSE.cache[path])
                  }
                  else {

//                      console.log("LOADING TAB", tab);

                      try {
                          Tabletop.init({
                              key: path,
                              callback: function (data, tabletop) {
                                  if (tab in data) {

                                      // Insert in cache
                                      DATAVERSE.cache[path] = data;
                                      callback(data[tab]['elements'], data);
                                  }
                                  else {
                                      console.error("Seems like tab ", tab, " does not exist.", viz_name, path, tab);
                                  }
                              },
                              parseNumbers: true
                          });
                      }
                      catch (err) {

                          console.error("Error accessing spreadsheet: ", err, viz_name, path, tab);
                          if (callback) callback(data);

                      }
                  }

              }
          }
          else {

              // DO NOT USE CACHE IF STANDALONE VIZ!!!

                  try {
                      Tabletop.init({
                          key: path,
                          callback: function (data, tabletop) {
                              callback(data);
                          },
                          simpleSheet: true,
                          parseNumbers: true
                      });
                  }
                  catch (err) {

                      console.error("Error accessing spreadsheet: ", viz_name, err, path);
                      if (callback) callback(data);

                  }
              // }
          }

      }
      else {

          console.error("Data for viz is not in a recognizable format (csv or GSheets)", viz_name);
          callback(null);

      }
  }


};