var debugView = false

window.addEventListener('load', function(){
    if (!debugView) {
        model.fetch();
        dataSet = [
            {label: "王宁晨", data: 100, color:"#005CDE"},
            {label: "王宇炜", data: 10, color:"#00A36A"},
            {label: "耿正霖", data: 10, color:"#7D0096"}
        ];
        options = {
            series: {
                pie: {
                    show: true,
                    radius: 0.8,
                    formatter: function (label, series) {
                        return '<div style="border:1px solid grey;font-size:8pt;text-align:center;padding:5px;color:white;">' +
                        label + ' : ' +
                        Math.round(series.percent) +
                        '%</div>';
                    },
                    background: {
                        opacity: 0.8,
                        color: '#000'
                    },
                    label: {
                        show: true
                    }
                }
            },
            legend: {
                show: false,
            }
        };
        $.plot($('#result'), dataSet, options);
    }
    else {
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
    var tab = new Navigation('.ui-tab-nav', '.ui-tab-content');
})    

