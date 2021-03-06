/**
 * Created with PyCharm.
 * User: Epsirom
 * Date: 13-12-3
 * Time: 下午11:12
 */

function clearActs() {
    $('#tbody-activities').html('');
}

//var vote_acts=[
//    {
//        'id':5,
//        'status': 0,
//        'name': '游泳教练',
//        'description':'不知所措',
//        'start_time': new Date(2014, 11, 7, 10, 4),
//        'end_time': new Date(2014, 11, 17, 10, 4)
//    },
//    {
//        'id':2,
//        'status': 1,
//        'name': '游泳教练',
//        'description':'不知所措',
//        'start_time': new Date(2014, 11, 7, 10, 4),
//        'end_time': new Date(2014, 11, 17, 10, 4)
//    },
//    {
//        'id':7,
//        'status': 2,
//        'name': '游泳教练',
//        'description':'不知所措',
//        'start_time': new Date(2014, 11, 7, 10, 4),
//        'end_time': new Date(2014, 11, 17, 10, 4)
//    }
//];
var operations_target = {'detail':''};
var operations_icon = {'edit':'pencil', 'delete':'trash'};
var operations_name = {'edit':'编辑', 'delete':'删除'};


function getSmartStatus(act) {
    var now = new Date();
    switch (act.status){
        case 0:
            return '未发布';
        case 1:
            if (act.start_time > now)
                return '投票尚未开始';
            else if (act.end_time < now)
                return '投票已结束';
            else
                return '正在投票';
        case 2:
            return '结果已发布';
        default:
            return '未知';
    }
}

function wrapTwoDigit(num) {
    if (num < 10) {
        return '0' + num;
    } else {
        return num;
    }
}

function getChsDate(dt) {
    return wrapTwoDigit(dt.getDate()) + '日';
}

function getChsMonthDay(dt) {
    return wrapTwoDigit(dt.getMonth() + 1) + '月' + getChsDate(dt);
}

function getChsFullDate(dt) {
    return dt.getFullYear() + '年' + getChsMonthDay(dt);
}

function getChsDay(dt) {
    var dayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return dayMap[dt.getDay()];
}

function getTimeStr(dt) {
    return wrapTwoDigit(dt.getHours()) + ':' + wrapTwoDigit(dt.getMinutes());
}

function isSameYear(d1, d2) {
    return d1.getFullYear() == d2.getFullYear();
}

function isSameMonth(d1, d2) {
    return isSameYear(d1, d2) && (d1.getMonth() == d2.getMonth());
}

function isSameDay(d1, d2) {
    return isSameYear(d1, d2) && isSameMonth(d1, d2) && (d1.getDate() == d2.getDate());
}

function getSmartTimeRange(start_time, end_time) {
    var result = getChsFullDate(start_time) + ' ' + getChsDay(start_time) + ' ' + getTimeStr(start_time) + ' - ';
    if (isSameDay(start_time, end_time)) {
        result += getTimeStr(end_time);
    } else if (isSameMonth(start_time, end_time)) {
        result += getChsDate(end_time) + ' ' + getChsDay(end_time) + ' ' + getTimeStr(end_time);
    } else if (isSameYear(start_time, end_time)) {
        result += getChsMonthDay(end_time) + ' ' + getChsDay(end_time) + ' ' + getTimeStr(end_time);
    } else {
        result += getChsFullDate(end_time) + ' ' + getChsDay(end_time) + ' ' + getTimeStr(end_time);
    }
    return result;
}

function getTd(para) {
    return $('<td class="td-' + para + '"></td>');
}

function expand_long_text(dom) {
    var newhtml = '', par = $(dom).parent(), refdata = par.text();
    dom = $(dom);
    refdata = refdata.substring(0, refdata.length - 3);
    newhtml = dom.attr('ref-data') + ' <a style="cursor:pointer;" ref-data="' + refdata + '" ref-hint="' + dom.text() + '" onclick="expand_long_text(this);">' + dom.attr('ref-hint') + '</a>';
    par.html(newhtml);

}

var duringbook = new Array,beforeact = new Array, duringact = new Array;

var tdMap = {
    'status': 'status',
    'name': 'text',
    'description': 'longtext',
    'time': 'time',
    'operations': 'render_operations'
}, operationMap = {
    'checkin': function(act) {
        var now = new Date()
        if ((now <= act.book_start) || (now >= act.end_time)) {
            return false;
        } else {
            return true;
        }
    },
    'export': function(act) {
        return false;
    },
    'detail': function(act) {
        return true;
    }
}, tdActionMap = {
    'status': function(act, key) {
        return getSmartStatus(act);
    },
    'text': function(act, key) {
        return act[key];
    },
    'longtext': function(act, key) {
        var str = act[key];
        if (str.length > 55) {
            str = str.substr(0, 55) + '... <a style="cursor:pointer;" ref-data="' + act[key] + '" ref-hint="收起" onclick="expand_long_text(this);">展开</a>';
        }
        return str;
    },
    'time': function(act, key) {
        if (!act.start_time || !act.end_time){
            return '时间未设置完整';
        }
        return smartTimeMap[key](act);
    },
//    'operation_links': function(act, key) {
//        var links = act[key], result = [], i, len;
//        for (i in links) {
//            if (operationMap[i](act)) {
//                result.push('<a href="' + links[i] + '" target="' + operations_target[i] + '"><span class="glyphicon glyphicon-' + operations_icon[i] + '"></span> ' + operations_name[i] + '</a>');
//            }
//        }
//        return result.join('<br/>');
//    },
    'render_operations': function(act, key){
        var ops = []
        switch (getSmartStatus(act)){
            case '未发布':
                ops = ['edit','delete'];
                break;
            case '投票尚未开始':
                ops = ['detail', 'delete'];
                break;
            case '投票已结束':
                ops = ['detail', 'delete'];
                break;
            case '正在投票':
                ops = ['detail'];
                break;
            case '结果已发布':
                ops = ['detail', 'delete'];
                break;
        }
        var icons = {
            'edit':'pencil',
            'delete':'trash',
            'detail': 'briefcase'
        }
        var names = {
            'edit':'编辑',
            'delete':'删除',
            'detail':'详情'
        }
        function gethref(op, id){
            if (op === 'edit'){
                return '/vote/edit/'+id+'/';
            }
            else if (op === 'detail'){
                return '/vote/detail/'+id+'/'
            }
            else{
                return 'javascript:delete_activity(this,'+id+')';
            }
        }
        var result = [], i;
        for (i in ops){
            result.push('<a href="' + gethref(ops[i], act.id)+'"><span class="glyphicon glyphicon-' + icons[ops[i]] + '"></span> ' + names[ops[i]] + '</a>');
        }
        return result.join('&nbsp;&nbsp;');


    }
}, smartTimeMap = {
    'time': function(act) {
        return getSmartTimeRange(act.start_time, act.end_time);
    }
};

function getDateByObj(obj) {
    return obj;
}

function deleteact(actid){
    //alert(actid);
    var i, len, curact;
    for(i = 0, len = vote_acts.length; i < len; ++i){
        if(vote_acts[i].delete == actid){
            curact = vote_acts[i];
            break;
        }
    }
    var content = '确认删除<span style="color:red">'+getSmartStatus(curact)+'</span>活动：<span style="color:red">'+curact.name+'</span>？';
    $('#modalcontent').html(content);
    $('#'+actid).css("background-color","#FFE4C4");
    $('#deleteid').val(actid);
    $('#delModal').modal({
      keyboard: false,
      backdrop:false
    });
    return;
}

function delete_activity(node, id){
    delete_post(id);
    var $tr = $('#tr'+id);
    $tr.remove();

}


function delConfirm(){
    var delid = $('#deleteid').val();
    //alert(delid);
    var tmp  ="/delete/";
    $.post(tmp,{'activityId':delid}, function(ret) {
        $('#'+delid).css("background-color","#FFF");
        window.location.href="/list/"
    });
}

function delCancel(){
    var delid = $('#deleteid').val();
    $('#'+delid).css("background-color","#FFF");
}

function createtips(){
    var id;
    for(id in duringbook){
        $('#del'+duringbook[id]).popover({
            html: true,
            placement: 'top',
            title:'',
            content: '<span style="color:red;">活动正在投票中，不能删除!</span>',
            trigger: 'hover',
            container: 'body'
        });
    }
    for(id in beforeact){
        $('#del'+beforeact[id]).popover({
            html: true,
            placement: 'top',
            title:'',
            content: '<span style="color:red;">活动已出票，不能删除!</span>',
            trigger: 'hover',
            container: 'body'
        });
    }
    for(id in duringact){
        $('#del'+duringact[id]).popover({
            html: true,
            placement: 'top',
            title:'',
            content: '<span style="color:red;">活动正在进行中，不能删除!</span>',
            trigger: 'hover',
            container: 'body'
        });
    }
}

function appendAct(act) {
    var tr = $('<tr' + ((typeof act.id != "undefined") ? (' id="tr'+act.id+'"') : '') + '></tr>'), key;
    for (key in tdMap) {
        getTd(key).html(tdActionMap[tdMap[key]](act, key)).appendTo(tr);
    }
    //tr.css('cursor', 'pointer');

    $('#tbody-activities').append(tr);
}

function initialActs() {
    var i, len;
    for (i = 0, len = vote_acts.length; i < len; ++i) {
        appendAct(vote_acts[i]);
    }
    $('td.td-operations').css('text-align', 'center');
    $('.td-operations').click(function(event){event.stopPropagation();});
//    createtips();
}


var vote_acts;


function fromAPIFormat(data) {
    var result = [];
    var act;
    for (_act in data) {
        act = data[_act];
        var vote_act = {};
        vote_act.status = act.status;
        vote_act.name = act.name;
        vote_act.description = act.description;
        if (act.begin_vote){
            act.begin_vote = act.begin_vote.substring(0,10) + " " + act.begin_vote.substring(11);
            vote_act.start_time = new Date(act.begin_vote.replace(/-/g,"/"));
        }
        if (act.end_vote){
            act.end_vote = act.end_vote.substring(0,10) + " " + act.end_vote.substring(11);
            vote_act.end_time = new Date(act.end_vote.replace(/-/g,"/"));
        }



        vote_act.id = act.id;
        result.push(vote_act);
    }
    return result;
}


function getActs() {
    $.get("/api/v1/VoteAct/?format=json&status__gte=0",function (data, status) {
        console.log(status);
        vote_acts = fromAPIFormat(data.objects);
        clearActs();
        initialActs();
        //console.log(data);
    })

}

getActs();

function delete_post(id){
    $.ajax({
        url: "/api/v1/VoteAct/"+id+"/?format=json",
        type: "PATCH",
        data: '{"status":-1}',
        success: function() {
            getActs();
        },
        error: function() {
            getActs();
        },
        contentType: 'application/json'
    })
}

function initializeNav(){
    $('div.navbar-header a.navbar-brand').attr('href', '/vote/index/').css('cursor', 'pointer');
    $('ul.navbar-nav li.active a.btn-link').attr('href', '/vote/list/');
}

$('document').ready(function(){
    initializeNav();
})

