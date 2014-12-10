
var vote_activity = {
    'id':0,
    'name': '看蓝猫',
    'key':'klm',
    'start_time':'2014-12-01 9:40',
    'end_time':'2014-12-01 9:40',
    'act_pic':'../../static1/img/default.png/',
    'description':'description'
}

var candidates = [
    {
        'id':2,
        'name':'111',
        'votes':333
    },
    {
        'id':3,
        'name':'222',
        'votes':222
    },
    {
        'id':1,
        'name':'333',
        'votes':111
    }
]
function setForm(){
    $('#input-name').html(vote_activity.name);
    $('#input-key').html(vote_activity.key);
    $('#input-start_time').html(vote_activity.start_time);
    $('#input-end_time').html(vote_activity.end_time);
    $('#poster').attr('src',vote_activity.act_pic);
    $('#input-description').html(vote_activity.description);
}

setForm();

function view_table(){
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


