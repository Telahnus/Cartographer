// GLOBAL VARS
// connect to DB // should url be hidden for security?
var ref = new Firebase('https://intense-inferno-7135.firebaseio.com/');
var initialImage = 'http://i.imgur.com/1DK0zzD.jpg';
var map;
var state = "";
var curMap;

//http://kempe.net/blog/2014/06/14/leaflet-pan-zoom-image.html

$(document).ready(function(){

	// register DOMs
	var passInput = $('#passInput');
	var emailInput = $('#emailInput');
	var regBtn = $('#regBtn');
	var logBtn = $('#logBtn');
	var logoutBtn = $('#logoutBtn');
	var msgOut = $('#msg');
	var createBtn = $('#createBtn');
	var editBtn = $('#editBtn');

	// check auth to switch menus
	function checkAuth(){
		var authData = ref.getAuth();
		if (authData){ // user is logged in
			regBtn.hide(); $("#log-fields").hide(); logBtn.hide();
			editBtn.show(); createBtn.show(); logoutBtn.show();
		}else{
			regBtn.show(); $("#log-fields").show(); logBtn.show();
			editBtn.hide(); createBtn.hide(); logoutBtn.hide();
		}
	}
	checkAuth();

	// registration
	$('#regBtn').click(function(){
		ref.createUser({
			email : emailInput.val(),
			password : passInput.val()
		}, function(error, userData) {
			if (error) {
				console.log("Error creating user:", error);
				msgOut.text("Error creating user");
			} else {
				console.log("Successfully created user account with uid:", userData.uid);
				msgOut.text("Successfully created user account");
				// create section in DB for new user
				var newID = userData.uid;
				ref.child(newID).set({
					'user':emailInput.val()
				});
			}
		});
	});

	// loggin in
	logBtn.click(function(){
		ref.authWithPassword({
			email    : emailInput.val(),
			password : passInput.val()
		}, function(error, authData) { 
			if (error) {
				console.log("Login Failed!", error);
				msgOut.text("Login Failed")
			} else {
				console.log("Authenticated successfully with payload:", authData);
				msgOut.text("Login successful");
				checkAuth();
				//user = authData;
			}
		}, {
		remember: "sessionOnly"
		});
	});

	// logout
	logoutBtn.click(function(){
		ref.unauth();
		checkAuth();
		map.remove();
		mapInit(initialImage, 2246, 1456);
		msgOut.html("");
	});

	// load new map button
	createBtn.click(function(){
		state = "create map";

		var imgURL = prompt("Enter a link (ending in .jpg) to an image");
		var imgWidth;
		var imgHeight;

		var img = new Image();
		img.src = imgURL;

		img.onload = function() {
			imgWidth = this.width;
			imgHeight = this.height;
			if (imgWidth<2000 || imgHeight<2000) {imgWidth*=2; imgHeight*=2;}
			map.remove();
			mapInit(imgURL,imgWidth,imgHeight);
			// upload url to DB
			user = ref.getAuth().uid;
			ref.child(user).push({
				'url': imgURL
			});
		}
	});

	// load map list for edits
	editBtn.click(function(){
		state = "select map";
		user = ref.getAuth().uid;
		ref.child(user).once("value", function(snapshot) {
			var newhtml="";
			snapshot.forEach(function(data) {
				//console.log(data.key());
				var url = data.val().url;
				if (url){
					newhtml += '<img key="'+data.key()+'" class="thumbnail" src='+data.val().url+' height=100px>';
					msgOut.html(newhtml);
				}
			});
		}, function (errorObject) {
			console.log("The read failed: " + errorObject.code);
		});
	});

	mapInit(initialImage, 2246, 1456);

	$("#saveMarkerBtn").click(function(){
		var user = ref.getAuth().uid;
		var curKey = curMap;
		//remove all markers first 
		ref.child(user).child(curKey).child('markers').remove(
			function(error) {
				if (error) {
					console.log('Error removing markers');
				} else {
					console.log('Successfully removed markers');
				}
			});
		markers.forEach(function(entry) {
			var lat = entry.getLatLng().lat;
			var lng = entry.getLatLng().lng;
			var content = entry.getPopup().getContent();
			//console.log(lat +','+ lng +','+ content +','+ user +','+ curKey);
			ref.child(user).child(curKey).child('markers').push({
				'lat':lat,
				'lng':lng,
				'content':content
			}, function(error) {
				if (error) {
					console.log('Error adding marker');
				} else {
					console.log('Marker added');
				}
			});
		});

	});

}); // end of jquery ready doc

function mapInit(url, w, h){
	// create the slippy map
	map = L.map('image-map', {
		minZoom: 1,
		maxZoom: 4,
		center: [0, 0],
		zoom: 1,
		crs: L.CRS.Simple
	}); 
	// calculate the edges of the image, in coordinate space
	var southWest = map.unproject([0, h], map.getMaxZoom()-1);
	var northEast = map.unproject([w, 0], map.getMaxZoom()-1);
	var bounds = new L.LatLngBounds(southWest, northEast);
	// add the image overlay, so that it covers the entire map
	L.imageOverlay(url, bounds).addTo(map);
	// tell leaflet that the map is exactly as big as the image
	map.setMaxBounds(bounds);
	map.on('contextmenu', onMapClick);
	//curMap = url;
	console.log("map init done");
}

function loadMap(mapKey){

	ref.child(user).child(mapKey).once("value", function(snapshot) {
		//console.log(snapshot.val());
		curMap = mapKey;
		var imgURL = snapshot.val().url //decodeURIComponent(uri_enc);
		var imgWidth;
		var imgHeight;

		var img = new Image();
		img.src = imgURL;

		img.onload = function() {
			imgWidth = this.width;
			imgHeight = this.height;
			if (imgWidth<2000 || imgHeight<2000) {imgWidth*=2; imgHeight*=2;}
			//alert(imgWidth + 'x' + imgHeight);
			map.remove();
			mapInit(imgURL,imgWidth,imgHeight);
			markers = new Array();
			console.log("load map done");
			loadMarkers(mapKey);
		}
	}, function (errorObject) {
		curMap="";
		console.log("The read failed: " + errorObject.code);
	});
}

function loadMarkers(mapKey){
	ref.child().orderByKey().equalTo(mapKey).once("value", function(data) {
	//ref.once("value", function(data) {

		if (data.key()==mapKey){
			console.log("found map with key for markers");
		}
	});
}

$(document).on("click", ".thumbnail", function(){
	var mapKey = $(this).attr("key");
	loadMap(mapKey);
	$("#msg").html("");
	state = "editing";
});


// popups
//var popup = L.popup();
var markers = new Array();
function onMapClick(e) {
	var newMarker = L.marker(e.latlng).addTo(map)
    .bindPopup("You clicked the map at " + e.latlng.toString())
    .openPopup();
    if (markers.push(newMarker)){
    	console.log("pushed new Marker");
    }
/*	popup
		.setLatLng(e.latlng)
		.setContent("You clicked the map at " + e.latlng.toString())
		.openOn(map);*/
}

		