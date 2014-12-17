var debugView = false

window.addEventListener('load', function(){
    if (!debugView) {
        model.fetch();
        dataSet = [
            {label: "王宁晨", data: 180, color:"#3D7D53"},
            {label: "王宁晨", data: 1000, color:"#97CEA2"},
            {label: "王宁晨", data: 150, color:"#EDF1B0"},
            {label: "王宁晨", data: 120, color:"#CDDF74"},
            {label: "王宁晨", data: 340, color:"#36B596"}
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

        console.log(desc);
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
                }
            })(i))
        }
    }
    var tab = new Navigation('.ui-tab-nav', '.ui-tab-content');
})    

