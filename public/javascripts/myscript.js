$(document).ready(function(){
	//Materialize.updateTextFields();
	function displayTimeSinceUpdate(time) {
		time = Math.floor(time/60000);	
		if (time<1) {
			return "<1 minute ago";
		} else if (time > 60) {
			return ">1 hour ago";
		} else if (time > 120) {
			return ">2 hours ago";
		} else {
			return time.toString() + " minutes ago";
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
	$('.wait-time').click(function() {
		var payload = {time: parseInt(this.id,10), timeOfUpdate: Date.now()}; 
		console.log("hello");      
		$.ajax({
			type: 'POST',
			url: '/waittime',
			data: payload,
			//dataType: 'application/json',
			success: function(data) {
				console.log(data);
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
					$('.currentWaitTime').text(payload.time.toString() + " minutes");
				}
				$('.timeSinceUpdate').text(displayTimeSinceUpdate(Date.now()-payload.timeOfUpdate));
			}
		});
		
	});

	$(document).ready(function() {
		$('select').material_select();
	});

	$(document).ready(function(){
		// the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
		$('.modal').modal();
	});

	Materialize.updateTextFields();

});