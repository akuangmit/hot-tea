//var map;
var mapDirections;
var directionsDisplay;

// function initMap() {
//   var map = document.getElementById('map');
//   var id = map.className;
//   $.ajax({
//     type: 'POST',
//       url: '/map_location',
//       data: {id: id},
//       success: function(data) {
//         console.log(data);
//         var geocoder = new google.maps.Geocoder();
//         map = new google.maps.Map(document.getElementById('map'), {
//           center: {lat: 42.36346, lng: -71.09245},
//           zoom: 15
//         });
//         geocoder.geocode({'address': data}, function(results, status) {
//           if (status === 'OK') {
//             map.setCenter(results[0].geometry.location);
//             var marker = new google.maps.Marker({
//               map: map,
//               position: results[0].geometry.location
//             });
//           } else {
//               alert('Geocode was not successful for the following reason: ' + status);
//           }
//         });
//       }
//   }); 
// }

$(document).ready(function() {
  var map = document.getElementById('map');
  var id = map.className;
  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer();
  $.ajax({
    type: 'POST',
      url: '/map_location',
      data: {id: id},
      success: function(data) {
        console.log(data);
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
          } else {
              alert('Geocode was not successful for the following reason: ' + status);
          }
        });
      }
  }); 
  console.log("Hello");
  $('#get-directions').click(function() {
    directionsDisplay.setMap(null);
    directionsDisplay = null;
    $('#directionsPanel').empty();
    console.log("yay");
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directionsPanel'));
    var start = $('#start').val();
    var end = $('#end').val();
    var transport = $('.transport select').val();
    console.log(transport);
    console.log(start);
    var request = {
      origin: start,
      destination: end,
      travelMode: transport
    };
    directionsService.route(request, function(result, status) {
      if (status == 'OK') {
        console.log("woohoo!!");
        directionsDisplay.setDirections(result);
      }
    });
  });
});
