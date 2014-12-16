function formmatCandidates(candidates){
    var r = [];
    for (var i = 0; i < candidates.length; i++){
        r.push([candidates[i].name, candidates[i].votes]);
    }
    return r;
}

function no_candidates(candidates){
    if (typeof candidates === 'undefined' || candidates.length == 0) return true;
    return false;
}

function no_votes(candidates){
    for (var i in candidates){
        if (candidates[i].votes != 0) return false;
    }
    return true;
}

function show_error(msg){
    $('#detail_result').children().remove();
    var $div = $('<div>').attr('id', 'result');
    var $msg = $('<span>').css('font-weight', 'bold').css('margin','7em').text(msg);
    $div.append($msg);
    $('#detail_result').append($div);
    $('#download_btn').attr('disabled', 'disabled');
}

function removeBottomText(){
    $('text[text-anchor="end"').remove();
}
function view_pie(vote_act, candidates){
    if (no_candidates(candidates)){
        show_error('没有候选人！');
        return;
    }
    if (no_votes(candidates)){
        show_error('还没有人投票！');
        return;
    }
    var candsData = formmatCandidates(candidates);
    $('#detail_result').children().remove();
    var $con = $('<div id="container" style="min-width: 310px; height: 400px; max-width: 600px; margin: 0 auto">');
    $('#detail_result').append($con);
    $('#container').css('display', 'block');
  $(function () {
    $('#container').highcharts({
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 1,//null,
        plotShadow: false
      },
      title: {
        text: vote_act.name
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: {
              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
            }
          }
        }
      },
      series: [{
        type: 'pie',
        name: 'Browser share',
        data: candsData
//        data: [
//        ['Firefox',   45.0],
//        ['IE',       26.8],
//        {
//          name: 'Chrome',
//          y: 12.8,
//          sliced: true,
//          selected: true
//        },
//        ['Safari',    8.5],
//        ['Opera',     6.2],
//        ['Others',   0.7]
//        ]
      }]
    });
  });
removeBottomText()

}

function view_bar(vote_act, candidates){
    if (no_candidates(candidates)){
        show_error('没有候选人！');
        return;
    }
    if (no_votes(candidates)){
        show_error('还没有人投票！');
        return;
    }
    var candsData = formmatCandidates(candidates);
    $('#detail_result').children().remove();
    var $con = $('<div id="container" style="min-width: 310px; height: 400px; max-width: 600px; margin: 0 auto">');
    $('#detail_result').append($con);
    $('#container').css('display', 'block');
  $(function () {
    $('#container').highcharts({
      chart: {
        type: 'column'
      },
      title: {
        text: vote_act.name
      },
      xAxis: {
        type: 'category',
        labels: {
          rotation: -45,
          style: {
            fontSize: '13px',
            fontFamily: 'Verdana, sans-serif'
          }
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: '票数'
        }
      },
      legend: {
        enabled: false
      },
      tooltip: {
        pointFormat: 'Population in 2008: <b>{point.y:.1f} millions</b>'
      },
      series: [{
        name: 'Population',
        data: candsData,
//        data: [
//        ['Shanghai', 23.7],
//        ['Lagos', 16.1],
//        ['Instanbul', 14.2],
//        ['Karachi', 14.0],
//        ['Mumbai', 12.5],
//        ['Moscow', 12.1],
//        ['São Paulo', 11.8],
//        ['Beijing', 11.7],
//        ['Guangzhou', 11.1],
//        ['Delhi', 11.1],
//        ['Shenzhen', 10.5],
//        ['Seoul', 10.4],
//        ['Jakarta', 10.0],
//        ['Kinshasa', 9.3],
//        ['Tianjin', 9.3],
//        ['Tokyo', 9.0],
//        ['Cairo', 8.9],
//        ['Dhaka', 8.9],
//        ['Mexico City', 8.9],
//        ['Lima', 8.9]
//        ],
        dataLabels: {
          enabled: true,
          rotation: -90,
          color: '#FFFFFF',
          align: 'right',
          x: 4,
          y: 10,
          style: {
            fontSize: '13px',
            fontFamily: 'Verdana, sans-serif',
            textShadow: '0 0 3px black'
          }
        }
      }]
    });
  });
    removeBottomText()
}
function view_table(vote_act, candidates){
    if (no_candidates(candidates)){
        show_error('没有候选人！');
        return;
    }
    var $table = $('<table>').attr('class', 'table table-hover table-bordered').css('display', 'none');
    var $thead = $('<thead>');
    var $trh = $('<tr>');
    $trh.append($('<th>').html('编号'))
        .append($('<th>').html('候选人'))
        .append($('<th>').html('票数'));
    $thead.append($trh);
    $table.append($thead);
    var $tbody = $('<tbody>');
    for (var i in candidates){
        var $tr = $('<tr>');
        $tr.append($('<td>').html(candidates[i].id));
        $tr.append($('<td>').html(candidates[i].name));
        $tr.append($('<td>').html(candidates[i].votes));
        $tbody.append($tr);
    }
    $table.append($tbody);
    $thead.children('tr').children('th').css('text-align', 'center');
    $tbody.children('tr').children('td').css('text-align', 'center');
    $('#detail_result').children().remove();
    $('#detail_result').append($table);
    $table.slideDown();
}
