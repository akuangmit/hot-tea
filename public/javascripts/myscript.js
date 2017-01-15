$(document).ready(function(){
	//Materialize.toast('Welcome!!', 4000);
	$('.grey-text').mouseenter(function(){
		$(this).css("text-decoration", "underline");
	});
	$('.grey-text').mouseleave(function(){
		$(this).css("text-decoration", "none");
	});

	$('#abouttext').mouseenter(function(){
		$(this).css("text-decoration", "underline");
	});
	$('#abouttext').mouseleave(function(){
		$(this).css("text-decoration", "none");
	});
	$('.parallax').parallax();
	 // $('.modal').modal();
	 // $('.modal-trigger').leanModal();

});