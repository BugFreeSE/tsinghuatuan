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
    //candidate_list.fetch();
    model.fetch();
    /*var tab = new Scroll('.ui-tab', {
        role: 'tab',
        autoplay: false,
        interval: 3000
    });*/
    var tab = new Navigation('.ui-tab-nav', '.ui-tab-content');
})    

