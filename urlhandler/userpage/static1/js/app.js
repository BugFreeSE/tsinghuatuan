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
	render: function() {
		var dest = tpl(this.template, this.data);
		$(this.target).replaceWith(dest);
	},
	fetch: function(callback) {
		callback = callback ? callback : function(data) {
			this.data = data;
			render();
		};
		$.getJSON(this.url, callback);
	}
}

var homepage = new View({
	url: "",
	target: "#home",
	template:// '<div id="home" class="ui-scroller">' + 
          	'<div id="home" style="margin-left:10%; margin-right:10%; padding-top:30px; text-align:center">' +
            '<img id="poster" src="<%=poster_url%>"/>' +
            '<p id="description"><%=description%></p>' + 
           	'</div>',
    data: {
		poster_url: "img/test.jpg",
		description: "袁扬姐姐太强了！"
    }
})

var candidate_list = new View({
	url: "",
	target: "#candidates",
	template: 
		'<div id="candidate">' +
			'<ul class="candidate-list">' +
				'<% for (var i = 0; i < candidates.length; i++) { %>' +
				'<li>' +
					'<img class="candidate-poster" src="<%=candidates[i].poster_url%>" />' + 
					'<p class="infomation"><%=candidates[i].description%></p>' + 
					'</li>' +
				'<% } %>' +
			'</ul>' +
		'</div>',
	data: {
		candidates: [{
			poster_url: "img/test.jpg",
			description: "袁扬姐姐太强了！"
		}, {
			poster_url: "img/test.jpg",
			description: "袁扬姐姐太强了！"
		}, {
			poster_url: "img/test.jpg",
			description: "袁扬姐姐太强了！"
		}, {
			poster_url: "img/test.jpg",
			description: "袁扬姐姐太强了！"
		}]
	}
})

tpl = function (a,c,d){var e=/[^\w\-\.:]/.test(a)?function(a,b){var c,d=[],f=[];for(c in a)d.push(c),f.push(a[c]);return new Function(d,e.code).apply(b||a,f)}:b.cache[a]=b.cache[a]||this.get(document.getElementById(a).innerHTML);return e.code=e.code||"var $parts=[]; $parts.push('"+a.replace(/\\/g,"\\\\").replace(/[\r\t\n]/g," ").split("<%").join("	").replace(/(^|%>)[^\t]*/g,function(a){return a.replace(/'/g,"\\'")}).replace(/\t=(.*?)%>/g,"',$1,'").split("	").join("');").split("%>").join("$parts.push('")+"'); return $parts.join('');",c?e(c,d):e}