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
		$.getJSON('/u/vote/info/' + vote_id + '/', callback);
	}
})

var homepage = new Observer({
    template:
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
                    '<span><img class="avatar shadow" src="<%=candidates[i].pic%>" /></span>' +
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
            '<div><strong class="highlight">活动代码&nbsp;&nbsp;</strong> <span><%=key%></span></div>' +
            '<div><strong class="highlight">投票方式&nbsp;&nbsp;</strong> <span>微信回复“投票 活动代码 候选人编号列表”，例如“投票 <%=key%> 1 3”。也可以在“候选人”标签页下直接投票。</span></div>' +
        '</div>' +
        '<!--信息部分3：活动介绍-->' +
        '<div class="top_border">' +
            '<div><strong class="highlight">活动介绍</strong></div>' +
            '<span><%=description%></span>' +
        '</div>'/* +
        '<!--信息部分4：抽奖信息-->' +
        '<div class="top_border">' +
            '<div><strong class="highlight">抽奖信息</strong></div>' +
            '<span>活动结束后将从参与者中抽取3名幸运观众，获得神秘礼品一份~</span>' +
        '</div>'*/,
    target: '#home',
    update: function(model) {
        var dest = tpl(this.template, model.data);
        $(this.target).html(dest);
    }
})

var candidates = new Observer({
    template:
        '<% if (status == "正在进行") { %>' +
        '<form id="vote" style="font-size:10px; display:none;">' +
            '<div id="vote_area">' +
                '<div style="text-align:center;">' +
                    '<div class="highlight" style="font-size:x-large;">投票</div>' +
                    '<div>限选<%=config%>人</div>' +
                '</div>' +
                '<table id="vote_table">' +
                '<% for (i = 0; i < parseInt((candidates.length - 1) / 5) + 1; i++) { %>' +
                    '<tr>' +
                    '<% for (j = 0; j < 5 && j < candidates.length - i * 5; j++) { %>' +
                        '<td class="table_avatar" colspan="2">' +
                            '<img class="avatar shadow" src="<%=candidates[i * 5 + j].pic%>" />' +
                        '</td>' +
                    '<% } %>' +
                    '</tr>' +
                    '<tr>' +
                    '<% for (j = 0; j < 5 && j < candidates.length - i * 5; j++) { %>' +
                        '<td><input type="checkbox" name="voted" class="hidden"></td>' +
                        '<td><div>编号&nbsp;<%=candidates[i * 5 + j].key%></div><div><%=candidates[i * 5 + j].name%></div></td>' +
                    '<% } %>' +
                    '</tr>' +
                '<% } %>' +
                '</table>' +
            '</div>' +
        '</form>' +
         '<% } %>' +
        '<div class="top_border" style="text-align: center;">' +
            '<div class="highlight" style="font-size:x-large; font-weight:bold;">候选人信息</div>' +
        '</div>' +
        '<% if (status == "正在进行") { %>' +
        '<div style="margin: 0 20px 20px 20px; font-size:12px;">'+
            '<p>现在是投票期间，您可以点击候选人头像或其下方选框选中候选人，然后点击提交按钮给他/她（们）投票。您也可以通过发送微信消息投票，消息格式参见“主页”标签页的说明。</p>'+
            '<p>注意本次活动<span class="small_highlight">限选<%=config%>人</span>。每个学号只能投<span class="small_highlight">一次</span>票哦~</p>'+
        '</div>' +
        '<% } %>' +
        '<ul class="candidate-list">' +
            '<% for (i = 0; i < candidates.length; i++) { %>' +
            '<li class="over_hidden candidate-li" id="candidate<%=i%>">' +
                '<table class="one_candidate">' +
                    '<tr>' +
                        '<% if (i % 2 == 0) { %>' +
                        '<td class="candidate_img_container content_top">' +
                            '<div class="candidate_td">' +
                            '<div class="click_area">'+
                            '<img class="candidate_img shadow" src="<%=candidates[i].pic%>"/>' +
                            '<div style="font-size:16px">' +
                                '<span class="highlight">编号&nbsp;<%=candidates[i].key%></span>' +
                            '</div>' +
                            '<div style="font-size:16px">' +
                                '<span style="font-weight: bold"><%=candidates[i].name%></span>' +
                            '</div>' +
                            '</div>' +
                            '<% if (status == "正在进行") { %>' +
                            '<div class="icon-unselected"></div>'+
                            '<% } %>' +
                            '<div class="show">' +
                                '<span class="icon-show"></span>' +//'<img style="width: 10px;" src="img/show.gif"/>' +
                                '<span style="font-size:12px;">&nbsp;展开</span>' +
                            '</div>' +
                            '</div>' +
                        '</td>' +
                        '<td class="candidate_info content_top">' +
                            '<p><%=candidates[i].description %></p>' +
                        '</td>' +
                        '<% } else { %>' +
                        '<td class="candidate_info content_top">' +
                            '<p><%=candidates[i].description %></p>' +
                        '</td>' +
                        '<td class="candidate_img_container content_top">' +
                            '<div class="candidate_td">' +
                            '<div class="click_area">'+
                            '<img class="candidate_img shadow" src="<%=candidates[i].pic%>"/>' +

                            '<div style="font-size:16px">' +
                                '<span class="highlight">编号&nbsp;<%=candidates[i].key%></span>' +
                            '</div>' +
                            '<div style="font-size:16px">' +
                                '<span style="font-weight: bold"><%=candidates[i].name%></span>' +
                            '</div>' +
                            '</div>' +
                            '<% if (status == "正在进行") { %>' +
                            '<div class="icon-unselected"></div>' +
                            '<% } %>' +
                            '<div class="show">' +
                                '<span class="icon-show"></span>' +//'<img style="width: 10px;" src="img/show.gif"/>' +
                                '<span style="font-size:12px;">&nbsp;展开</span>' +
                            '</div>' +
                            '</div>' +
                        '</td>' +
                        '<% } %>' +
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
        '</ul>'+
        '<% if (status == "正在进行") { %>' +
        '<div style="margin: 20px;">' +
                '<div id="submit_button">提交</div>' +
                '<button class="hidden">提交</button>' +
        '</div>' +
        '<% } %>'
    ,
    target: '#candidates',
    update: function(model) {
        var dest = tpl(this.template, model.data);
        $(this.target).html(dest);
        desc = $('.candidate_info');
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
                    window.location.hash = '#candidate' + i;
                    window.location.hash = '#';
                }
            })(i))
        }

        real_checkbox = $('[name=voted]');
        fake_checkbox = $('.icon-unselected');
        click_areas = $('.click_area');

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
            $(click_areas[i]).click((function (i){
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

        var tab = new Scroll('.ui-tab', {
            role: 'tab',
            autoplay: false,
            interval: 3000
        });

        tab.on('slideStart', function() {
            console.log('start')
        });

        tab.on('slideEnd', function() {
            console.log('end')
        });



        $('#submit_button').click(function() {
            var data = {}
            var csrf_input = $(csrf);
            data[csrf_input.attr('name')] = csrf_input.val();
            var checks = $('[name=voted]');
            data['activity'] = vote_id
            data['student_id'] = stu_id
            data['voted'] = []
            for (var i = 0; i < checks.length; i++) {
                data['voted'].push(checks[i].checked)
            }
            $.post('/u/vote/submit/', data, function(data) {alert(data);});
        })
    }
})

var statistics = new Observer({
    update: function(model) {
        var dataSet = [];
        var keySet = [];
        var colors = ['#F6BD0F', '#AFD8F8', '#8BBA00', '#FF8E46', '#008E8E', '#D64646', '#8E468E'];
        for (var i = 0; i < model.data.candidates.length; i++) {
            keySet.push(model.data.candidates[i].name);
            dataSet.push({y: model.data.candidates[i].vote, color: colors[i % colors.length]});
        }
        if (model.data.status != "即将开始") {
            var chart = $('<div id="chart" style="width:100%;height:300px"></div>');
            $('#statistics').children('.loading').replaceWith(chart);
            $('#chart').highcharts({
                chart: {
                    type: 'bar',
                    backgroundColor: 'rgba(0, 0, 0, 0)'
                },
                title: {
                    text: false
                },
                xAxis: {
                    categories: keySet,
                    title: {
                        text: null
                    },
                    gridLineWidth: 0,
                    lineWidth: 0,
                    tickLength: 0
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: null,
                        align: 'high'
                    },
                    labels: {
                        enabled: false
                    },
                    gridLineWidth: 0,
                    lineWidth: 0,
                    tickPixelInterval: 40
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    },
                    series: {
                        pointWidth: 12
                    }
                },
                legend: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                exporting: {
                    enabled: false
                },
                series: [{
                    name: 'Year 1800',
                    data: dataSet
                }]
            });
        }
        else {
            $('#statistics').children('.loading').text('活动尚未开始');
        }
    }
})
model.attachObserver(homepage);
model.attachObserver(candidates);
model.attachObserver(statistics);

window.addEventListener('load', function() {
    model.fetch();
    //var tab = new Navigation('.ui-tab-nav', '.ui-tab-content');
})