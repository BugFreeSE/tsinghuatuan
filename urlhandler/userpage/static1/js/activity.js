window.addEventListener('load', function(){
    //model.fetch();
        show_button = $('.show');
        hide_button = $('.hide');
        for (var i = 0; i < show_button.length; i++) {
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
            $(hide_button[i]).click((function (i){
                return function (){
                    $('.candidate-li:eq(' + i + ')').addClass('over_hidden');
                    $('.candidate_img_container:eq(' + i + ')').addClass('content_top');
                    $(hide_button[i]).addClass('hidden');
                    $(show_button[i]).removeClass('hidden');
                }
            })(i))
        }
    var tab = new Navigation('.ui-tab-nav', '.ui-tab-content');
})    

