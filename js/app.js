$(function () {
	
	var initialData = {
		mainMap: {
			center: {lat: 48.834536, lng: 2.317754},
			zoom: 15,
			mapTypeControl: false
		},
		mapMarkers: [
			{
				position: new google.maps.LatLng(48.83397,2.31655),
				title: 'L\'Entrepôt'
			},
			{
				position: new google.maps.LatLng(48.83340,2.32438),
				title: 'Prik Thaï'
			},
			{
				position: new google.maps.LatLng(48.84171,2.30705),
				title: 'Chez Quan'
			},
			{
				position: new google.maps.LatLng(48.84622,2.33716),
				title: 'Jardin du Luxembourg'
			},
			{
				position: new google.maps.LatLng(48.84060,2.34944),
				title: 'La BocaMexa'
			},
			{
				position: new google.maps.LatLng(48.82423,2.29881),
				title: 'McDonald\'s Brancion'
			}
		]
	};
	
	var ViewModel = function () {
		var self = this;
		
		self.map = new google.maps.Map(document.getElementById('map-canvas'), initialData.mainMap);
		
		self.markers = ko.observableArray(initialData.mapMarkers);
		for (var i = 0; i < self.markers().length; i++) {
			self.markers()[i].map = self.map;
			new google.maps.Marker(self.markers()[i]);
		}
		
		self.displayResults = function() {
			console.log("Ça marche !");
		};
		
	};
		
	
	ko.applyBindings(new ViewModel());
});