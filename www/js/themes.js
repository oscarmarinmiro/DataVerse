DATAVERSE.themes =
{
    'dark': {
        'color_scale': 'category20b',
        'default_color': 'grey',
        'cursor_color': 'red',
        'floor': 'yellow',
        'sky': 'examples/world100/media/sky_one.jpg',
        'icon_path': 'themes/dark/icons',
        'text_color': 'yellow',
        'text_background': 'green',
//https://aframe.io/docs/0.8.0/components/text.html
        'text_font': 'monoid',
        'map_provider': 'CartoDB.DarkMatter',
        'earth_texture': 'themes/dark/textures/8081-earthmap10k.jpg',
        'timeline_color': '#000',
        'panel_color': "white",
        'panel_aux_color': "black",
        'panel_font': "roboto",
        'panel_background': "black",
        'panel_backpanel': "white"

    },
    'light': {
        'color_scale': 'category10',
        'default_color': 'purple',
        'cursor_color': 'purple',
        'floor': '#AAA',
        'sky': 'green',
        'icon_path': 'themes/light/icons',
        'text_color': 'black',
        'text_background': 'white',
        'text_font': 'kelsonsans',
        'map_provider': 'CartoDB.Positron',
        'earth_texture': 'themes/light/textures/8081-earthmap10k.jpg',
        'timeline_color': '#BFF',
        'panel_color': "black",
        'panel_aux_color': "white",
        'panel_font': "dejavu",
        'panel_background': "white",
        'panel_backpanel': "black"

    }
};


DATAVERSE.floor_vizs = ['isotypes-radial-viz', 'timeline-viz'];

DATAVERSE.sky_vizs = ['isotypes-radial-viz', 'timeline-viz', 'photogrid-viz', 'small-treemap-viz', 'tilemap-viz'];
