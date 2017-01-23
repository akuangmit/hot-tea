$(document).ready(function(){
    function isEmail(email) {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
    }

    function validPassword(password) {
        // at least 6 char, 1 number, 1 upper, 1 lower
        var regex = (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/);
        return regex.test(password);
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
        var payload = {time: parseInt(this.id,10)}; 
        console.log("hello");      
        $.ajax({
            type: 'POST',
            url: '/waittime',
            data: payload,
            //dataType: 'application/json',
            success: function(data) {
                console.log(data);
                $('.currentWaitTime').text(payload.time.toString() + " minutes");
            }
        });
        
    });

    $('.modalsubmit').click(function(){
        var email = $("#email_address").val();
        var password = $("#password").val();

        if (isEmail(email) && validPassword(password)) {
            $('.loginsubmit').addClass("modal-close");
        }
    });


    $(document).ready(function() {
        $('select').material_select();
    });
    
    $(document).ready(function(){
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal').modal();
});

    //Materialize.updateTextFields();

});