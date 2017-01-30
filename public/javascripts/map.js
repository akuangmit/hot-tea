var map;

function initMap() {
  var map = document.getElementById('map');
  var id = map.className;
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
  
}