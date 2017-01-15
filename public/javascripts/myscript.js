$(document).ready(function(){
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
});