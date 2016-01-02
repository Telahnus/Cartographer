/*
  file: index.js;
  author: telahnus;
  desc: js for main page;
*/  

// general map creation
  // single image functions by http://kempe.net/blog/2014/06/14/leaflet-pan-zoom-image.html

  // create the slippy map
  var map = L.map('image-map', {
    minZoom: 1,
    maxZoom: 4,
    center: [0, 0],
    zoom: 1,
    crs: L.CRS.Simple,
  });

  // dimensions of the image
  var w = 2246,
      h = 1456,
      url = 'http://i.imgur.com/1DK0zzD.jpg';
  /*var w = 4000,
      h = 2528,
      url = 'http://i.imgur.com/DxHGLp2.png';*/

  // calculate the edges of the image, in coordinate space
  var southWest = map.unproject([0, h], map.getMaxZoom()-1);
  var northEast = map.unproject([w, 0], map.getMaxZoom()-1);
  var bounds = new L.LatLngBounds(southWest, northEast);

  // add the image overlay, 
  // so that it covers the entire map
  L.imageOverlay(url, bounds).addTo(map);

  // tell leaflet that the map is exactly as big as the image
  map.setMaxBounds(bounds);
  // end of general map creation


// popups
var popup = L.popup();

function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map);
}

map.on('click', onMapClick);