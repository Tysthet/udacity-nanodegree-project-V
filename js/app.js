var googleError = function() {
	$("main").text("Something went wrong with Google Maps. Check your internet access.");
};

var googleSuccess = function () {
	
	var initialData = {
		mainMap: {
			center: {lat: 48.834536, lng: 2.317754},
			zoom: 15,
			mapTypeControl: false
		},
		mapMarkers: [
			{
				position: new google.maps.LatLng(48.83397,2.31655),
				title: 'L\'Entrepôt',
				category: 'Concert venue'
			},
			{
				position: new google.maps.LatLng(48.83340,2.32438),
				title: 'Prik Thaï',
				category: 'Thai restaurant'
			},
			{
				position: new google.maps.LatLng(48.84171,2.30705),
				title: 'Chez Quan',
				category: 'Bar'
			},
			{
				position: new google.maps.LatLng(48.84622,2.33716),
				title: 'Jardin du Luxembourg',
				category: 'Park'
			},
			{
				position: new google.maps.LatLng(48.84060,2.34944),
				title: 'La BocaMexa',
				category: 'Mexican restaurant'
			},
			{
				position: new google.maps.LatLng(48.82423,2.29881),
				title: 'McDonald\'s Brancion',
				category: 'Fast food'
			}
		],
		contentString : function(heading, suggestions) {
			return '<div id="infoContent">'+
						'<h1>'+ heading +'</h1>' +
						'<p>Here are some similar places in the area:</p>' +
						'<p>' + suggestions + '</p>' +
						'</div>';
		}
	};
	
	var ViewModel = function () {
		var self = this;
		
		self.map = ko.observable(new google.maps.Map(document.getElementById('map-canvas'), initialData.mainMap));
		
		self.userInput = ko.observable('');

		self.markers = ko.observableArray();
		initialData.mapMarkers.forEach(function(place) {
			self.markers.push(place);
		});
		
		self.infoWindow = ko.observable(new google.maps.InfoWindow({
				content: ""
			}));
		
		self.allMarkers = [];
		self.setMarkers = ko.computed(function() {
			for (var i = 0; i < self.markers().length; i++) {
				self.markers()[i].map = self.map();
				var marker = new google.maps.Marker(self.markers()[i]);
				self.allMarkers.push(marker);

				marker.addListener('click', (function() {
					return function() {
						self.map().panTo(this.position);
						
						self.infoWindow().content = initialData.contentString(this.title);
						self.infoWindow().open(self.map(), this);
					};
				})());
			}
		}, this);
		
		self.filterMarkers = function() {
			return ko.computed(function() {
				var searchInput = self.userInput().toLowerCase();
				self.markers.removeAll();
				self.allMarkers.forEach(function(marker) {
					marker.setMap(null);
				});
				initialData.mapMarkers.forEach(function(place) {
					if (place.title.toLowerCase().indexOf(searchInput) !== -1) {
						self.markers.push(place);
						self.setMarkers();
					}
				});
			}, self);
		};
		
		self.displayFoursquare = function(data) {
			console.log(data);
			console.log(self.allMarkers[0]);
      
			var review = $.ajax("https://api.foursquare.com/v2/venues/explore" +
				"?client_id=BJPXEHF02BJRASDOVZFBTHE3AFMIG0PB0CAFFSZNB4XAWGHS" +
				"&client_secret=MW5QV2SJS4FDQKS21MADPQGWB0V1YDJ2HVFESGLXBGZK2PXD" +
				"&v=20130815&near=Paris, France&query=" + data.category, {
				success: function(result) {
					var similarVenues = result.response.groups[0].items;
					for (var i = 0; i < similarVenues.length; i++) {
						self.infoWindow().content = initialData.contentString(data.title, similarVenues[i].venue.name);
						console.log(similarVenues[i].venue.name);
					}
					self.infoWindow().open(self.map(), self.allMarkers[0]);
				},
				error: function() {console.log("no");}
			});
		
		};
		
	};
	ko.applyBindings(new ViewModel());
	// Ça marche toujours ? Et là ? Yep.
};