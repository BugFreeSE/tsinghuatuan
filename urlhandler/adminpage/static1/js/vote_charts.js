function formmatCandidates(candidates){
    var r = [];
    for (var i = 0; i < candidates.length; i++){
        r.push([candidates[i].name, candidates[i].votes]);
    }
    return r;
}

function view_pie(vote_act, candidates){
    var candsData = formmatCandidates(candidates);
    $('.container table').remove();
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


}

function view_bar(vote_act, candidates){
    var candsData = formmatCandidates(candidates);
    $('.container table').remove();
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
}
function view_table(vote_act, candidates){
    var $table = $('<table>').attr('class', 'table table-hover table-bordered').css('width', '95%');
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
    $('#container').css('display', 'none');
    $('div.panel-body div.container').append($table);
}
