tpl = function (a,c,d){var e=/[^\w\-\.:]/.test(a)?function(a,b){var c,d=[],f=[];for(c in a)d.push(c),f.push(a[c]);return new Function(d,e.code).apply(b||a,f)}:b.cache[a]=b.cache[a]||this.get(document.getElementById(a).innerHTML);return e.code=e.code||"var $parts=[]; $parts.push('"+a.replace(/\\/g,"\\\\").replace(/[\r\t\n]/g," ").split("<%").join("	").replace(/(^|%>)[^\t]*/g,function(a){return a.replace(/'/g,"\\'")}).replace(/\t=(.*?)%>/g,"',$1,'").split("	").join("');").split("%>").join("$parts.push('")+"'); return $parts.join('');",c?e(c,d):e}

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
        console.log(arguments);
        console.log(view.template);

		var dest = tpl(view.template, view.data);
        console.log(dest);
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
	url: '/api/v1/VoteAct/' + vote_id + '/?format=json',
	target: "#home",
	template:// '<div id="home" class="ui-scroller">' + 
          	'<div id="home" style="margin-left:10%; margin-right:10%; padding-top:30px; text-align:center">' +
            '<img id="poster" src="#"/>' +
            '<p id="description"><%=description%></p>' + 
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

