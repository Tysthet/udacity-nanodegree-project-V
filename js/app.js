// Fallback in case of Google Maps failure.
var googleError = function() {
	$("main").text("Something went wrong with Google Maps. Please make sure that you have access to internet.");
};

// Interpreted as soon as Google Maps has successfully loaded.
var googleSuccess = function () {
	
	// This is the Model that contains all of the data we'll use for launching the app.
	var initialData = {
		mainMap: {
			center: {lat: 48.834536, lng: 2.317754},
			zoom: 13,
			mapTypeControl: false
		},
		mapMarkers: [
			{
				title: 'L\'Entrepôt',
				category: 'Concert venue',
				lat: 48.83397,
				lng: 2.31655
			},
			{
				title: 'Prik Thaï',
				category: 'Thai restaurant',
				lat: 48.83340,
				lng: 2.32438
			},
			{
				title: 'Chez Quan',
				category: 'Bar',
				lat: 48.84171,
				lng: 2.30705
			},
			{
				title: 'Jardin du Luxembourg',
				category: 'Park',
				lat: 48.84622,
				lng: 2.33716
			},
			{
				title: 'La BocaMexa',
				category: 'Mexican restaurant',
				lat: 48.84060,
				lng: 2.34944
			},
			{
				title: 'McDonald\'s Brancion',
				category: 'Fast food',
				lat: 48.82423,
				lng: 2.29881
			}
		],
		contentString : function(heading, suggestions) {
			return '<div id="infoContent">'+
				'<h2>'+ heading +'</h2>' +
				'<p>Here are some similar places in the area:</p>' +
				'<ul>' + suggestions + '</ul>' +
				'</div>';
		},
		fsCall: "https://api.foursquare.com/v2/venues/explore" +
				"?client_id=BJPXEHF02BJRASDOVZFBTHE3AFMIG0PB0CAFFSZNB4XAWGHS" +
				"&client_secret=MW5QV2SJS4FDQKS21MADPQGWB0V1YDJ2HVFESGLXBGZK2PXD" +
				"&v=20130815&near=Paris, France&query=",
		fsError: '<div id="infoContent">'+
						'<h2>Woops!</h2>' +
						'<p>Looks like Foursquare\'s suggestions engine doesn\'t work.</p>' +
						'<p>Please check your internet connection or try again later.</p>' +
						'</div>'
	};
	
	// This function is in the global scope so it can easily be accessible.
	var closeMenu = function() {
		$("aside").addClass("active");
		$("aside form").hide();
		$("aside ul").hide();
	};
	
	var init = function() {
		
		// Creating the map.
		map = new google.maps.Map(document.getElementById('map-canvas'), initialData.mainMap);
		
		infoWindow = new google.maps.InfoWindow({
				content: ""
			});
		
		// Adding the map and position property to our marker data.
		initialData.mapMarkers.forEach(function(place) {
			place.map = map;
			place.position = new google.maps.LatLng(place.lat,place.lng);
		});
		
		// Setting the open / close button for the menu.
		$("#close").click(function(e) {
			e.preventDefault();
			$("aside").toggleClass("active");
			$("aside form").toggle();
			$("aside ul").toggle();
		});
			
		// Launching KO's binding engine.
		ko.applyBindings(new ViewModel());
	};
	
	// The ViewModel, as per Knockout.js desired structure
	var ViewModel = function () {
		var self = this;
		
		// This property will receive the text entered in the input field.
		self.userInput = ko.observable('');

		// Creating an observable array and pushing the marker info from the Model in it.
		self.markersData = ko.observableArray();
		initialData.mapMarkers.forEach(function(place) {
			self.markersData.push(place);
		});
		
		// This array will host all the google.maps.Marker objects.
		self.allMarkers = [];
		
		// This function takes in a marker object, makes an AJAX call to Foursquare API,
		// uses the result to set the infowindow's content and opens it on the map.
		// A fallback is implemented in case of error.
		var displayFoursquare = function(data) {
      
			$.ajax(initialData.fsCall + data.category, {
				
				success: function(result) {
					var similarVenues = result.response.groups[0].items;
					var placesArray = [];
					var linkList = "";
					
					// I chose to limit the number of suggestions to 5.
					// TODO: Include a pagination system to access more links.
					for (var i = 0; i < 5; i++) {
						placesArray.push(similarVenues[i].venue);
					}
					
					placesArray.forEach(function(place) {
						var listElement = "";
						if (place.url) {
						listElement += "<li><a href='" + place.url + "' target='_blank'>" +
								place.name + "</a></li>";
						} else {
							listElement += "<li>" + place.name + "</li>";
						}
						linkList += listElement;
					});
					
					if (self.allMarkers.length !== 0) {
						self.allMarkers.forEach(function(marker) {
							marker.setAnimation(undefined);
						});
					}
					
					data.setAnimation(google.maps.Animation.BOUNCE);
					infoWindow.setContent(initialData.contentString(data.title, linkList));
					infoWindow.open(map, data);
					infoWindow.addListener('closeclick', function() {
							data.setAnimation(undefined);
						});
				},
				
				error: function() {
					infoWindow.setContent(initialData.fsError);
					infoWindow.open(map, data);
				}
			});	
		};
		
		// This function creates the google.maps.Marker objects and places them on the map.
		// It also creates the click events that trigger the infowindow.
		
		self.setMarkers = function() {
			for (var i = 0; i < self.markersData().length; i++) {
				var marker = new google.maps.Marker(self.markersData()[i]);
				marker.addListener('click', (function(marker, i) {
					return function() {
						closeMenu();
						displayFoursquare(marker);
						var panOffset = {lat: marker.lat + 0.025, lng: marker.lng};
						map.panTo(panOffset);		
        	};
				})(marker, i));
				self.allMarkers.push(marker);
			}
		};
		self.setMarkers();
		
		// This enables to also display the infowindow from the list view.
		self.displayInfo = function(marker) {
			closeMenu();
			var placeIndex = self.markersData().indexOf(marker);
			var markerObject = self.allMarkers[placeIndex];
			displayFoursquare(markerObject);
			var panOffset = {lat: markerObject.lat + 0.025, lng: markerObject.lng};
			map.panTo(panOffset);
		};
		
		// Provides a way to filter markers by first clearing all the markers and then
		// updating the observable array by testing it against the input from the user.	
		self.filterMarkers = function() {
			var searchInput = self.userInput().toLowerCase();
			self.markersData.removeAll();
			self.allMarkers.forEach(function(marker) {
				marker.setMap(null);
			});
			self.allMarkers = [];
			initialData.mapMarkers.forEach(function(place) {
				if (place.title.toLowerCase().indexOf(searchInput) !== -1) {
					self.markersData.push(place);
				}
			});
			self.setMarkers();
		};
		
	};
	
	// Calling the initialisation function in last.
	init();
};
