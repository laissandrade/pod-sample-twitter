var map;
var markers = [];
var infoWindows = [];

function parseDoc(doc, highlights) {
	var content = '<span class="header">';

	if(highlights && highlights.fullname) {
		content += highlights.fullname[0];
	}
	else {
		content += doc.fullname;
	}

	content += ' (<i>@' + doc.username + '</i>):</span><br>';

	if(highlights && highlights.text) {
		highlights.text.forEach(function(highlight) {
			content += '<br>' + highlight;
		})
	}
	else {
		content += doc.text;
	}

	return content;
}

function clearPlot() {
	markers.forEach(function(marker) {
		marker.setMap(null);
	});
	infoWindows.forEach(function(infoWindow) {
		infoWindow.close();
	});
	markers = [];
	infoWindows = [];
}

function plot(map, doc, highlights, callback) {
	var latlng = doc.location.split(',');
	var lat = parseFloat(latlng[0]);
	var lng = parseFloat(latlng[1]);

	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(lat, lng),
		map: map,
		title: doc.username
	});

	var infoWindow = new google.maps.InfoWindow({
		content: parseDoc(doc, highlights),
		disableAutoPan : true
	});

	google.maps.event.addListener(marker, 'click', function() {
		infoWindow.open(marker.map,marker);
	});

    if(callback) {
        google.maps.event.addListener(marker, 'rightclick', function () {
            callback(map, doc.text);
        });
    }

    markers.push(marker);
	infoWindows.push(infoWindow);
}

function debounce(fn, delay) {
	var id;
	return function() {
		var args = arguments;
		clearTimeout(id);
		id = setTimeout(function() {
			fn.apply(this, args);
		}, delay);
	};
}

google.maps.event.addDomListener(window, 'load', function() {
	var center = {
		lat: 40.7033127,
		lng: -73.979681
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), {
		center: center,
		zoom: 12
	});

	var reloadTweetsDebounced = debounce(reloadTweets.bind(null, map), 100);

	google.maps.event.addListener(map, 'bounds_changed', reloadTweetsDebounced);
});