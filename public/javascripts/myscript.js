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
	  if (time === 999) {
	    return "Closed";
	  }

	  else if (time === 240) {
	    return "Unknown";
	  }

	  else if (time === 0) {
	    return "No Wait";
	  } else if (time >= 180) {
	  	return "3+ hours";
	  }
	  else if (time > 60) {
	    var hours = Math.floor(time/60);
	    var minutes = time%60;
	    if (minutes === 0) {
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

	$('.wait-time').click(function() {
		var payload = {time: parseInt(this.id,10), timeOfUpdate: Date.now()};      
		sendWaitTime(payload);
	});

	$('.enterWait').click(function() {
		var hours = $('.input-hours select').val();
		var minutes = $('.input-minutes select').val();
		if (hours===null) {
			hours = 0;
		}
		if (minutes===null) {
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
				if (payload.time === 999) {
					$('.currentWaitTime').text("Closed");
				}

				else if (payload.time === 240) {
					$('.currentWaitTime').text("Unknown");
				}

				else if (payload.time === 0) {
					$('.currentWaitTime').text("No Wait");
				}

				else {
					$('.currentWaitTime').text(displayTime(payload.time));
				}
				$('.timeSinceUpdate').text(displayTimeSinceUpdate(Date.now()-payload.timeOfUpdate));
			}
		});
	}

	if (top.location.pathname.includes("/users")) {
		var ctx = document.getElementById("myChart");
		var restaurantName = document.getElementById("restaurant-name").textContent;
		// console.log({name: restaurantName});
		$.ajax({
			type: 'POST',
			url: '/bar_graph ',
			data: {name: restaurantName},
			success: function(data) {
				dataPoints = []
				thursdayData = data[4];
				for (var i=0; i<24;i++) {
					dataPoints.push(thursdayData[i]);
				}
				var myChart = new Chart(ctx, {
			    type: 'bar',
			    data: {
			        labels: ["12 am", "1 am", "2 am", "3 am", "4 am", "5 am", "6 am", "7 am", "8 am", 
			        "9 am", "10 am", "11 am", "12 pm", "1 pm", "2 pm", "3 pm", "4 pm", "5 pm", "6 pm",
			        "7 pm", "8 pm", "9 pm", "10 pm", "11 pm"],
			        datasets: [{
			            label: 'Thursday',
			            data: dataPoints,
			            backgroundColor: [
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(255, 206, 86, 0.2)',
			                'rgba(75, 192, 192, 0.2)',
			                'rgba(153, 102, 255, 0.2)',
			                'rgba(255, 159, 64, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(255, 206, 86, 0.2)',
			                'rgba(75, 192, 192, 0.2)',
			                'rgba(153, 102, 255, 0.2)',
			                'rgba(255, 159, 64, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(255, 206, 86, 0.2)',
			                'rgba(75, 192, 192, 0.2)',
			                'rgba(153, 102, 255, 0.2)',
			                'rgba(255, 159, 64, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(255, 206, 86, 0.2)',
			                'rgba(75, 192, 192, 0.2)',
			                'rgba(153, 102, 255, 0.2)',
			                'rgba(255, 159, 64, 0.2)'
			            ],
			            borderColor: [
			                'rgba(255,99,132,1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(255, 206, 86, 1)',
			                'rgba(75, 192, 192, 1)',
			                'rgba(153, 102, 255, 1)',
			                'rgba(255, 159, 64, 1)',
			                'rgba(255,99,132,1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(255, 206, 86, 1)',
			                'rgba(75, 192, 192, 1)',
			                'rgba(153, 102, 255, 1)',
			                'rgba(255, 159, 64, 1)',
			                'rgba(255,99,132,1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(255, 206, 86, 1)',
			                'rgba(75, 192, 192, 1)',
			                'rgba(153, 102, 255, 1)',
			                'rgba(255, 159, 64, 1)',
			                'rgba(255,99,132,1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(255, 206, 86, 1)',
			                'rgba(75, 192, 192, 1)',
			                'rgba(153, 102, 255, 1)',
			                'rgba(255, 159, 64, 1)'
			            ],
			            borderWidth: 1
			            // xAxisID: "Time of Day",
			            // yAxisID: "Wait Time"
			        }]
			    },
			    options: {
			        scales: {
			            yAxes: [{
			                ticks: {
			                    beginAtZero:true
			                }
			            }]
			        }
			    }
			  });
			}
		});
	};

	$('.button-collapse').sideNav({
    	menuWidth: 300,
    	closeOnClick: true,
    	edge: 'right',
    	}
  	);
  	
  	$('.collapsible').collapsible();

	$('select').material_select();

	// the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
	$('.modal').modal();

	//Materialize.updateTextFields();

});