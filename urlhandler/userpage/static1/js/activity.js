var debugView = false

window.addEventListener('load', function(){
    if (!debugView) {
        model.fetch();
    }
    else {

        console.log(desc);
        show_button = $('.show');
        hide_button = $('.hide');
        for (var i = 0; i < show_button.length; i++) {
            console.log($(desc[i]).height());
            if($(desc[i]).height() < 210){
                console.log(i+"too short");
                $(show_button[i]).remove();
                continue;
            }
            $(show_button[i]).click((function (i){
                return function (){
                    $('.candidate-li:eq(' + i + ')').removeClass('over_hidden');
                    $('.candidate_img_container:eq(' + i + ')').removeClass('content_top');
                    $(show_button[i]).addClass('hidden');
                    $(hide_button[i]).removeClass('hidden');
                }
            })(i))
        }
        for (var i = 0; i < hide_button.length; i++) {
            if($(desc[i]).height() < 210){
                $(hide_button[i]).remove();
                continue;
            }
            $(hide_button[i]).click((function (i){
                return function (){
                    $('.candidate-li:eq(' + i + ')').addClass('over_hidden');
                    $('.candidate_img_container:eq(' + i + ')').addClass('content_top');
                    $(hide_button[i]).addClass('hidden');
                    $(show_button[i]).removeClass('hidden');
                }
            })(i))
        }
    }
    var tab = new Navigation('.ui-tab-nav', '.ui-tab-content');
})    

