tpl = function (a,c,d){var e=/[^\w\-\.:]/.test(a)?function(a,b){var c,d=[],f=[];for(c in a)d.push(c),f.push(a[c]);return new Function(d,e.code).apply(b||a,f)}:b.cache[a]=b.cache[a]||this.get(document.getElementById(a).innerHTML);return e.code=e.code||"var $parts=[]; $parts.push('"+a.replace(/\\/g,"\\\\").replace(/[\r\t\n]/g," ").split("<%").join("	").replace(/(^|%>)[^\t]*/g,function(a){return a.replace(/'/g,"\\'")}).replace(/\t=(.*?)%>/g,"',$1,'").split("	").join("');").split("%>").join("$parts.push('")+"'); return $parts.join('');",c?e(c,d):e}


function Observer(options) {
	for (var item in options) {
		this[item] = options[item];
	}
}

function Subject(options) {
	for (var item in options) {
		this[item] = options[item];
	}
	this.observerList = [];
}

Subject.prototype = {
	attachObserver: function(observer) {
		this.observerList.push(observer);
	},
	notify: function() {
        console.log(this);
		for (var i = 0; i < this.observerList.length; i++) {
			console.log(this.observerList[i]);
			this.observerList[i].update(this);
		}
	}
}

var model = new Subject({
	fetch: function() {
        var model = this;
        callback = function(data) {
            model.data = data;
            console.log(data);
            model.notify();
        }
		$.getJSON('/u/vote/info/' + vote_id, callback);
	}
})

var homepage = new Observer({
    template:
        '<div id="home" style="font-size:14px;">' +
            '<div class="poster_container">' +
                '<img id="poster" style="width:100%;" src="<%=pic%>"/>' +
            '</div>' +
                '<!--信息部分1：活动标题、时间、候选人头像列表、候选人人数、参与者人数-->' +
            '<div style="text-align: center; padding: 10px;">' +
                '<div style="font-size:x-large; font-weight:bold;"><%=name%></div>' +
                '<div style="font-size:12px;"><%=start%> - <%=end%></div>' +
                '<div><strong class="highlight"><%=status%></strong></div>' +
                '<div id="avatar-list" style="margin: 10px 10px;">' +
                    '<% for (i = 0; i < candidates.length && i < 5; i++) { %>' +
                        '<span><img class="avatar shadow" src="candidates[i].pic" /></span>' +
                    '<% } %>' +
                '</div>' +
                '<table class="tb_counter" cellpadding="0" cellspacing="0">' +
                    '<tbody>' +
                        '<tr>' +
                            '<td>' +
                            '</td>' +
                            '<td class="S_line1">' +
                                '<strong><%=candidate_num%></strong>' +
                                '<span class="highlight">候选人</span>' +
                            '</td>' +
                            '<td class="S_line1" style="border-left-style: solid;">' +
                                '<strong><%=participant_num%></strong>' +
                                '<span class="highlight">参与者</span>' +
                            '</td>' +
                            '<td>' +
                            '</td>' +
                    '</tbody>' +
                '</table>' +
            '</div>' +
            '<!--信息部分2：投票形式、活动代码、投票方式-->' +
            '<div class="top_border">' +
                '<div><strong class="highlight">投票形式&nbsp;&nbsp;</strong> <span>限选<%=config%>人</span></div>' +
                '<div><strong class="highlight">活动代码&nbsp;&nbsp;</strong> <span>嘉宾</span></div>' +
                '<div><strong class="highlight">投票方式&nbsp;&nbsp;</strong> <span>微信回复“投票 活动代码 候选人编号列表”。例如“投票 嘉宾 1 3”</span></div>' +
            '</div>' +
            '<!--信息部分3：活动介绍-->' +
            '<div class="top_border">' +
                '<div><strong class="highlight">活动介绍</strong></div>' +
                '<span>你想在校歌赛上看到谁？快来投票吧！</span>' +
            '</div>' +
            '<!--信息部分4：抽奖信息-->' +
            '<div class="top_border">' +
                '<div><strong class="highlight">抽奖信息</strong></div>' +
                '<span>活动结束后将从参与者中抽取3名幸运观众，获得神秘礼品一份~</span>' +
            '</div>' +
        '</div>',
    target: '#home',
    update: function(model) {
        var dest = tpl(this.template, model.data);
        $(this.target).replaceWith(dest);
    }
})

var candidates = new Observer({
    template:
        '<div id="candidates" style="font-size:14px;">' +
            '<div style="text-align: center;">' +
                '<div style="font-size:x-large; font-weight:bold;">候选人信息</div>' +
            '</div>' +
            '<ul class="candidate-list">' +
                '<% for (i = 0; i < candidates.length; i++) { %>' +
                '<li class="over_hidden candidate-li">' +
                    '<table class="one_candidate">' +
                        '<tr>' +
                            '<td class="candidate_img_container content_top">' +
                                '<img class="candidate_img shadow" src="<%=candidates[i].pic%>"/>' +
                                '<div style="font-size:16px">' +
                                    '<span class="highlight">编号&nbsp;<%=candidates[i].key%></span>' +
                                '</div>' +
                                '<div style="font-size:16px">' +
                                    '<span style="font-weight: bold"><%=candidates[i].name%></span>' +
                                '</div>' +
                                '<div></div>' +
                                '<div class="show" style="margin-top: 45px;">' +
                                    '<span class="icon-show"></span>' +//'<img style="width: 10px;" src="img/show.gif"/>' +
                                    '<span style="font-size:12px;">&nbsp;展开</span>' +
                                '</div>' +
                            '</td>' +
                            '<td class="candidate_info">' +
                                '<p><%=candidates[i].description %></p>' +
                            '</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td style="text-align: center" colspan="2">' +
                                '<div class="hide hidden">' +
                                    '<span class="icon-hide"></span>' +
                                    '<span style="font-size:12px;">&nbsp;收起</span>' +
                                '</div>' +
                            '</td>' +
                        '</tr>' +
                    '</table>' +
                '</li>' +
                '<% } %>' +
            '</ul>' +
        '</div>',
    target: '#candidates',
    update: function(model) {
        var dest = tpl(this.template, model.data);
        $(this.target).replaceWith(dest);
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

    }
})

model.attachObserver(homepage);
model.attachObserver(candidates);
/*
function View(options) {
	this.template = options.template;
	this.url = options.url;
//	this.method = options.method;
	this.target = options.target;
	this.data = options.data;
	if (options.fetch) {
		this.fetch = options.fetch;
	}
	if (options.render) {
		this.render = options.render;
	}
}

View.prototype = {
	render: function(view) {
        console.log(view.data);

		var dest = tpl(view.template, view.data);
		$(this.target).replaceWith(dest);
	},
	fetch: function(callback) {
        var view = this;
        callback = callback ? callback : function(data) {
			view.data = data;
            view.render(view);
		};
		$.getJSON(this.url, callback);
	}
}

var homepage = new View({
	url: '/u/vote/info/' + vote_id,
	target: "#home",
	template:
          	'<div id="home" style="font-size:14px;">' +
                '<div class="poster_container">' +
                    '<img id="poster" style="width:100%;" src="http://hdn.xnimg.cn/photos/hdn521/20120210/1750/h_large_YZaI_71850005ba532f76.jpg"/>' +
                '</div>' +
                    '<!--信息部分1：活动标题、时间、候选人头像列表、候选人人数、参与者人数-->' +
                    '<div style="text-align: center; padding: 10px;">' +
                        '<div style="font-size:x-large; font-weight:bold;"><%=name%></div>' +
                        '<div><%=start%> - <%=end%>&nbsp;&nbsp; <strong class="highlight"><%=status%></strong></div>' +
                        '<div id="avatar-list" style="margin: 10px 10px;">' +
                            '<span><img class="avatar shadow" src="http://tp1.sinaimg.cn/1752467960/180/1283204936/0" /></span>' +
                            '<span><img class="avatar shadow" src="http://tp2.sinaimg.cn/1752502537/180/5648896565/1" /></span>' +
                            '<span><img class="avatar shadow" src="http://tp3.sinaimg.cn/1195354434/180/5712827770/1" /></span>' +
                            '<span><img class="avatar shadow" src="http://tp2.sinaimg.cn/1732008061/180/5706365063/1" /></span>' +
                            '<span><img class="avatar shadow" src="http://tp4.sinaimg.cn/1717748707/180/40010130572/1" /></span>' +
                        '</div>' +
                        '<table class="tb_counter" cellpadding="0" cellspacing="0">' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td>' +
                                    '</td>' +
                                    '<td class="S_line1">' +
                                        '<strong>10</strong>' +
                                        '<span class="highlight">候选人</span>' +
                                    '</td>' +
                                    '<td class="S_line1" style="border-left-style: solid;">' +
                                        '<strong>100</strong>' +
                                        '<span class="highlight">参与者</span>' +
                                    '</td>' +
                                    '<td>' +
                                    '</td>' +
                            '</tbody>' +
                        '</table>' +
                    '</div>' +
                    '<!--信息部分2：投票形式、活动代码、投票方式-->' +
                    '<div class="top_border">' +
                        '<div><strong class="highlight">投票形式&nbsp;&nbsp;</strong> <span>限选3人</span></div>' +
                        '<div><strong class="highlight">活动代码&nbsp;&nbsp;</strong> <span>嘉宾</span></div>' +
                        '<div><strong class="highlight">投票方式&nbsp;&nbsp;</strong> <span>微信回复“投票 活动代码 候选人编号列表”。例如“投票 嘉宾 1 3”</span></div>' +
                    '</div>' +
                    '<!--信息部分3：活动介绍-->' +
                    '<div class="top_border">' +
                        '<div><strong class="highlight">活动介绍</strong></div>' +
                        '<span>你想在校歌赛上看到谁？快来投票吧！</span>' +
                    '</div>' +
                    '<!--信息部分4：抽奖信息-->' +
                    '<div class="top_border">' +
                        '<div><strong class="highlight">抽奖信息</strong></div>' +
                        '<span>活动结束后将从参与者中抽取3名幸运观众，获得神秘礼品一份~</span>' +
                    '</div>' +
                '</div>',
    data: {
		poster_url: "img/test.jpg",
		description: "袁扬姐姐太强了！"
    }
})

var candidate_list = new View({
	url: "/api/v1/Candidate/?format=json&activity_id=" + vote_id,
	target: "#candidates",
	template: 
		'<div id="candidate">' +
			'<ul class="candidate-list">' +
				'<% for (var i = 0; i < objects.length; i++) { %>' +
				'<div class="clear-fix">' +
                    '<img class="candidate-poster" src="img/test.jpg" />' +
                        '<div class="candidate-info">' +
                            '<div class="candidate-info-bar"><span>编　　号：</span><%=objects[i].id%></div>' +
                                '<div class="candidate-info-bar"><span>姓　　名：</span><%=objects[i].name%></div>' +
                            '</div>' +
                            '<span>详细信息：</span>' +
                            '<div class="candidate-description brief">' +
                                '<%=objects[i].description%>' +
                            '</div>' +
                                '<a class="show-more" href="#">查看更多</a>' +
                                '<a class="show-more hidden" href="#">收起</a>' +
                            '</div>' +
				'<% } %>' +
			'</ul>' +
		'</div>',
    data: {
        objects: [
            {
                id: 1,
                name: 21,
                description: 1212
            }
        ]
    }
})

*/