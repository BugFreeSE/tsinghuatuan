function Navigation(nav, content) {
	bars = $(nav).children();
	for (var i = 0; i < bars.length; i++) {
		$(bars[i]).click((function (i){
			return function() {
				$(nav).children().removeClass('current');
				$(nav).children(':eq(' + i + ')').addClass('current');
				$(content).attr('style', 'left: -' + (i * 100) + '%');
			}
		})(i));
	}
}