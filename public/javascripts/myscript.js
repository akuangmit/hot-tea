$(document).ready(function(){

	function displayTimeSinceUpdate(time) {
		time = Math.floor(time/60000);	
		if (time<1) {
			return "updated < 1 minute ago";
		} else if (time > 60) {
			return "updated > 1 hour ago";
		} else if (time > 120) {
			return "updated > 2 hours ago";
		} else {
			return "updated " + time.toString() + " minutes ago";
		}
	}

	/* convert wait time in minutes to display time */
	function displayTime(time) {
	  if (time == 999) {
	    return "Closed";
	  }

	  else if (time == 240) {
	    return "Unknown";
	  }

	  else if (time == 0) {
	    return "No Wait";
	  } else if (time >= 180) {
	  	return "3+ hours";
	  }
	  else if (time > 60) {
	    var hours = Math.floor(time/60);
	    var minutes = time%60;
	    if (minutes == 0) {
	      return hours.toString() + " hours";
	    }
	    return hours.toString() + " hours " + minutes.toString() + " minutes";
	  } 

	  else {
	    return time.toString() + " minutes";
	  }
	}

	//Materialize.toast('Welcome!!', 4000);
	$('.footerLink').mouseenter(function(){
		$(this).css("text-decoration", "underline");
	});
	$('.footerLink').mouseleave(function(){
		$(this).css("text-decoration", "none");
	});

	$('#abouttext').mouseenter(function(){
		$(this).css("text-decoration", "underline");
	});
	$('#abouttext').mouseleave(function(){
		$(this).css("text-decoration", "none");
	});
	$('.parallax').parallax(); 

	$('.search').click(function() {
		
	})

	$('.wait-time').click(function() {
		var payload = {time: parseInt(this.id,10), timeOfUpdate: Date.now()};      
		sendWaitTime(payload);
	});

	$('.enterWait').click(function() {
		var hours = $('.input-hours select').val();
		var minutes = $('.input-minutes select').val();
		if (hours==null) {
			hours = 0;
		}
		if (minutes == null) {
			minutes = 0;
		}
		var payload = {time: parseInt(hours,10)*60+parseInt(minutes,10), timeOfUpdate: Date.now()};
		sendWaitTime(payload);
	});

	function sendWaitTime(payload) {
		$.ajax({
			type: 'POST',
			url: '/waittime',
			data: payload,
			//dataType: 'application/json',
			success: function(data) {
				if (payload.time == 999) {
					$('.currentWaitTime').text("Closed");
				}

				else if (payload.time == 240) {
					$('.currentWaitTime').text("Unknown");
				}

				else if (payload.time == 0) {
					$('.currentWaitTime').text("No Wait");
				}

				else {
					$('.currentWaitTime').text(displayTime(payload.time));
				}
				$('.timeSinceUpdate').text(displayTimeSinceUpdate(Date.now()-payload.timeOfUpdate));
			}
		});
	}

	$(".button-collapse").sideNav();

	$('select').material_select();

	// the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
	$('.modal').modal();

	//Materialize.updateTextFields();

});