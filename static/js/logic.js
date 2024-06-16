// Creating tile layer to be background of the map

let basemap = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
    {
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    });

// Create map /object

let myMap = L.map("map", {
        center:[40.719074,-74.050552],// Jersey City, NJ.
        zoom: 4

});

// Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.

basemap.addTo(myMap)
let tectonicPlates = new L.LayerGroup();
let earthquakes =  new L.LayerGroup();
let baseMaps = {
    "Global Earthquakes": basemap
};

// create overlay map
let overlays = {
    "Tectonic Plates": tectonicPlates,
    Earthquakes : earthquakes
};

L.control.layers(baseMaps, overlays).addTo(myMap);

url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Loading data into d3/ using then (promise) function
// create function to style map
     
d3.json(url).then(function (data) {
    function styleInfo(feature) {
        return {
            opacity: 0.5,
            fillOpacity: 0.5,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        }
    };

// create function to color circles according to depth , using switch/case instead of
// if else  
    function getColor(depth){
        switch(true){
            case depth > 90:
                return "#ea2c2c";
            case depth > 70:
                return "#ea22c2";
            case depth > 50:
                return "#ee9c00";
            case depth > 30:
                return "#eecc00"
            case depth > 10:
                return "#d4ee00";
            default:
                return "#98ee00";
        }
    };

// create radius funtion for size of circles based on magnitude
    function getRadius(magnitude){
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 3
    }

// adding features with bindPopup 
    L.geoJson(data, {
        pointToLayer: function (feature, latlng){
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature : function (feature, layer) {
            layer.bindPopup(
                "Magnitude: "
                + feature.properties.mag
                +"<br>Depth: "
                +feature.geometry.coordinates[2]
                +"<br>Location: "
                + feature.properties.place
            );
        }
    }).addTo(earthquakes);
    earthquakes.addTo(myMap);

// ad
    let legend = L.control({
        position: "bottomright"
    });

// create div for legend , create buckets for colors, adding colors to legend
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let grades = [-10, 10, 30, 50, 70, 90];
        let colors = [
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c"
        ];

// conditional for loop  for legend
        for (let i =0; i < grades.length; i++){
            div.innerHTML += "<i style='background: " + colors[i] + "'><i>"
            + grades[i] + (grades[i +1 ] ? "&ndash;" + grades[i+1]+ "<br>" : "+");
        }
        return div;
    };

// adding to map
    legend.addTo(myMap);

// getting tectonic plate info, adding features
let tectonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
d3.json(tectonicUrl).then(function (platedata){
    L.geoJson(platedata, {
        color: "orange",
        weight: 2
    }).addTo(tectonicPlates);
    tectonicPlates.addTo(myMap);
    });
});





