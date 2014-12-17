var debugView = false

window.addEventListener('load', function(){
    if (!debugView) {
        model.fetch();

        desc = $('.candidate_info');
        console.log(desc);
        show_button = $('.show');
        hide_button = $('.hide');
        real_checkbox = $('input');
        fake_checkbox = $('.icon-unselected');
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
        for (var i = 0; i < fake_checkbox.length; i++) {
            $(fake_checkbox[i]).click((function (i){
                return function (){
                    if($(fake_checkbox[i]).attr("class") == "icon-unselected") {
                        $(fake_checkbox[i]).addClass('icon-selected');
                        $(fake_checkbox[i]).removeClass('icon-unselected');
                        real_checkbox[i].checked = true;
                    }else{
                        $(fake_checkbox[i]).addClass('icon-unselected');
                        $(fake_checkbox[i]).removeClass('icon-selected');
                        real_checkbox[i].checked = false;
                    }
                }
            })(i))
        }
    }
    var tab = new Navigation('.ui-tab-nav', '.ui-tab-content');
})    

