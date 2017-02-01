$(document).ready(function() {
  var select = document.getElementsByClassName('select-state')[0];
  var id = select.id;
  $.ajax({
    type: 'POST',
    url: '/state',
    data: {id: id},
    success: function(data) {
      if (data != "") {
        $('select option[value="' + data + '"]').attr("selected",true);
      } else {
        $('select option[value="AL"]').attr("selected",true);
      }
    }
  });
});