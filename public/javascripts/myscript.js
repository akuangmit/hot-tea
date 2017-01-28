$(document).ready(function(){
	/* randomize landing page background */

	var bgArray = ['jellycookies.jpg', 'bowls.jpg'];
	// 'strawberries.jpg', 'cookies3.jpg', 'rhubarb.jpg'
    var bg = bgArray[Math.floor(Math.random() * bgArray.length)];
    var path = '../images/';

    $('#landing-bg').attr('src', path+bg);

	$('.button-collapse').sideNav({
    	menuWidth: 300,
    	closeOnClick: true,
    	edge: 'right',
    	}
  	);
	
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

	function getDayOfWeek(day) {
		var days = {"Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6};
		return days[day];
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

	$('.dayPageInner').click(function() {
		$('.dayPage').removeClass("active active-page").addClass("waves-effect");
		$(this.parentNode).addClass("active active-page").removeClass("waves-effect");
		if($(this.parentNode).attr('id') === "Sat") {
			$($('.right-slider')[0].parentNode).addClass("disabled").removeClass("waves-effect");
		} else {
			if($($('.right-slider')[0].parentNode).hasClass("disabled")) {
				$($('.right-slider')[0].parentNode).removeClass("disabled").addClass("waves-effect");
			}
		}
		if($(this.parentNode).attr('id') === "Sun") {
			$($('.left-slider')[0].parentNode).addClass("disabled").removeClass("waves-effect");
		} else {
			if($($('.left-slider')[0].parentNode).hasClass("disabled")) {
				$($('.left-slider')[0].parentNode).removeClass("disabled").addClass("waves-effect");
			}
		}
		var ctx = document.getElementById("myChart");
		var restaurantName = document.getElementById("restaurant-name").textContent;
		var dayOfWeek = getDayOfWeek($(this.parentNode).attr('id'));
		sendGraph(ctx, restaurantName, dayOfWeek);
	});

	$('.right-slider').click(function() {
		var parent = $('.left-slider')[0].parentNode;
		$(parent).removeClass("disabled").addClass("waves-effect");
		if($(".active-page").attr('id') === "Fri") {
			var parent = $('.right-slider')[0].parentNode;
			$(parent).addClass("disabled").removeClass("waves-effect");
		}	
		if($(".active-page").attr('id') != "Sat"){
			$(".active-page").addClass("waves-effect");
			var next = $(".active-page").next()[0];
			$('.dayPage').removeClass("active active-page");
			$(next).addClass("active active-page").removeClass("waves-effect");
			var ctx = document.getElementById("myChart");
			var restaurantName = document.getElementById("restaurant-name").textContent;
			var dayOfWeek = getDayOfWeek($(next).attr('id'));
			sendGraph(ctx, restaurantName, dayOfWeek);
		}
	});

	$('.left-slider').click(function() {
		var parent = $('.right-slider')[0].parentNode;
		$(parent).removeClass("disabled").addClass("waves-effect");
		if($(".active-page").attr('id') === "Mon") {
			var parent = $('.left-slider')[0].parentNode;
			$(parent).addClass("disabled").removeClass("waves-effect");
		}
		if($(".active-page").attr('id') != "Sun"){
			$(".active-page").addClass("waves-effect");
			var prev = $(".active-page").prev()[0];
			$('.dayPage').removeClass("active active-page");
			$(prev).addClass("active active-page").removeClass("waves-effect");
			var ctx = document.getElementById("myChart");
			var restaurantName = document.getElementById("restaurant-name").textContent;
			var dayOfWeek = getDayOfWeek($(prev).attr('id'));
			sendGraph(ctx, restaurantName, dayOfWeek);
		}
	});

	if (top.location.pathname.includes("/users")) {
		var ctx = document.getElementById("myChart");
		var restaurantName = document.getElementById("restaurant-name").textContent;
		sendGraph(ctx, restaurantName, 0);
	};

	function sendGraph(ctx, restaurantName, dayOfWeek) {
		$.ajax({
			type: 'POST',
			url: '/bar_graph ',
			data: {name: restaurantName},
			success: function(data) {
				dataPoints = []
				dayData = data[dayOfWeek];
				for (var i=0; i<24;i++) {
					dataPoints.push(dayData[i]);
				}
				var myChart = new Chart(ctx, {
				responsive: true,
			    type: 'bar',
			    data: {
			        labels: ["12 am", "1 am", "2 am", "3 am", "4 am", "5 am", "6 am", "7 am", "8 am", 
			        "9 am", "10 am", "11 am", "12 pm", "1 pm", "2 pm", "3 pm", "4 pm", "5 pm", "6 pm",
			        "7 pm", "8 pm", "9 pm", "10 pm", "11 pm"],
			        datasets: [{
			        	label: "",
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
			            // xAxisID: "xAxis"
			            // yAxisID: "Wait Time"
			        }]
			    },
			    options: {
			    	legend: {
			    		display: false
			    	}, 
			    	title: {
                    display: true,
                    text: "Average Wait Times from Previous Week (Minutes)"
                },
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
	}

	/*
        Function to carry out the actual PUT request to S3 using the signed request from the app.
      */
      function uploadFile(file, signedRequest, url){
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedRequest);
        xhr.onreadystatechange = () => {
          if(xhr.readyState === 4){
            if(xhr.status === 200){
            	console.log(url);
            	$.ajax({
					type: 'POST',
					url: '/save-picture',
					data: {picture: url},
					success: function(data) {
						$('.update-picture').removeClass("disabled");
					}
				});
            }
            else{
              alert('Could not upload file.');
            }
          }
        };
        xhr.send(file);
      }
      /*
        Function to get the temporary signed request from the app.
        If request successful, continue to upload the file using this signed
        request.
      */
      function getSignedRequest(file){
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `/sign-s3?file-name=${file.name}&file-type=${file.type}`);
        xhr.onreadystatechange = () => {
          if(xhr.readyState === 4){
            if(xhr.status === 200){
              const response = JSON.parse(xhr.responseText);
              uploadFile(file, response.signedRequest, response.url);
            }
            else{
              alert('Could not get signed URL.');
            }
          }
        };
        xhr.send();
      }
      /*
       Function called when file input updated. If there is a file selected, then
       start upload procedure by asking for a signed request from the app.
      */
      function initUpload(){
      	$('.update-picture').addClass("disabled");
        const files = document.getElementById('file-input').files;
        const file = files[0];
        if(file == null){
          return alert('No file selected.');
        }
        getSignedRequest(file);
      }
      /*
       Bind listeners when the page loads.
      */
      if (top.location.pathname.includes("/users")) {
      	document.getElementById('file-input').onchange = initUpload;
      }

    $('#signup-modal').submit(function() {
    	if($("#signup-password").val() != $('#confirm-password').val()) {
    		$("#confirm-password").addClass("invalid");
    		$("#confirm-password").prop("aria-invalid", "true");
    		return false;
    	}
    });

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