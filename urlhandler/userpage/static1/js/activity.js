var data = {
	poster_url: "img/test.jpg",
	description: "袁扬姐姐太强了！"
}

var tplHTML='<div id="home" class="ui-scroller">' + 
            '<div id="home" style="margin-left:10%; margin-right:10%; padding-top:30px; text-align:center">' +
            '<img id="poster" src="<%=poster_url%>"/>' +
            '<p id="description"><%=description%>$(/</p>' + 
           	'</div>';

//var dest = $.tpl(tplHTML, data);


window.addEventListener('load', function(){
	//$('#home').html(dest);
	/*var el=$.loading({
		content: '加载中...'
	})*/
	//el.loading("hide");
    //homepage.render();
    //homepage.fetch();
    //candidate_list.render();
    candidate_list.fetch();
    /*var tab = new Scroll('.ui-tab', {
        role: 'tab',
        autoplay: false,
        interval: 3000
    });*/
    var tab = new Navigation('.ui-tab-nav', '.ui-tab-content');
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
})    

