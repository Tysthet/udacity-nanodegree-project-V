$(function () {
	
	var model = {
		mapOptions: {
			center: { lat: 48.834536, lng: 2.317754},
			zoom: 16
		}
	};
	
	var viewModel = {
		init: function () {
			var map = new google.maps.Map(document.getElementById('map-canvas'), model.mapOptions);
		}
	};
	
	var searchView = {};
	
	var markersView = {};
	
	viewModel.init ();
});