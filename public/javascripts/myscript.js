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
    $('.wait-time').click(function() {
        var payload = {time: parseInt(this.id,10)};       
        $.ajax({
            type: 'POST',
            url: '/waittime',
            data: payload,
            dataType: 'application/json',
            success: function(data) {
                console.log('success');
                console.log(data);
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