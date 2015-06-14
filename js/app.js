$.noConflict();
jQuery(document).ready(function ($)  {
	var model ={
		mapOptions: {
			center: { lat: -34.397, lng: 150.644},
			zoom: 8
		}
	};
	var viewModel = {
		init: function () {
			var mapOptions = {
				center: { lat: 48.834536, lng: 2.317754},
				zoom: 16
			};
			var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		}
	};
	var seachView = {};
	var markersView = {};

	
	// google.maps.event.addDomListener(window, 'load', initialize);
	viewModel.init ();
}) ();