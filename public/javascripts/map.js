var directionsDisplay;
var map;

function initMap() {
  map = document.getElementById('map');
  var id = map.className;
  $.ajax({
    type: 'POST',
      url: '/map_location',
      data: {id: id},
      success: function(data) {
        address = data;
        if (data != "") {
          var geocoder = new google.maps.Geocoder();
          map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 42.36346, lng: -71.09245},
            zoom: 15
          });
          geocoder.geocode({'address': data}, function(results, status) {
            if (status === 'OK') {
              map.setCenter(results[0].geometry.location);
              var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
              });
            } 
          });
        }
      }
  }); 
}

$(document).ready(function() {
  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer();
  $('#get-directions').click(function() {
    directionsDisplay.setMap(null);
    directionsDisplay = null;
    $('#directionsPanel').empty();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directionsPanel'));
    var start = $('#start').val();
    var end = $('#end').val();
    var transport = $('.transport select').val();
    var request = {
      origin: start,
      destination: end,
      travelMode: transport
    };
    directionsService.route(request, function(result, status) {
      if (status == 'OK') {
        directionsDisplay.setDirections(result);
      }
    });
  });
});
