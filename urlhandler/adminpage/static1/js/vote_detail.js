
var vote_activity = {
    'id':0,
    'name': '看蓝猫',
    'key':'klm',
    'start_time':new Date(2014, 12, 20, 4, 1),
    'end_time':new Date(2014, 12, 20, 5, 1),
    'act_pic':'../../static1/img/default.png/',
    'description':'description',
    'status':0
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

var id = 0;
function getActId(){
    var href = window.location.href;
    var b = href.lastIndexOf('/');
    var a = href.substring(0, b).lastIndexOf('/');
    id = href.substring(a+1, b);
}

getActId();

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

function getTimeStr(dt) {
    return wrapTwoDigit(dt.getHours()) + ':' + wrapTwoDigit(dt.getMinutes());
}
function setForm(){
    $('#input-name').html(vote_activity.name);
    $('#input-key').html(vote_activity.key);
    var start_time = getChsFullDate(vote_activity.start_time) + " " + getTimeStr(vote_activity.start_time);
    var end_time = getChsFullDate(vote_activity.end_time) + " " + getTimeStr(vote_activity.end_time);
    $('#input-start_time').html(start_time);
    $('#input-end_time').html(end_time);
    $('#poster').attr('src',vote_activity.act_pic);
    $('#input-description').html(vote_activity.description);
}



function getDate() {
    $.get("/api/v1/VoteAct/"+id+"/?format=json",function (data, status) {
        vote_activity = fromVoteActDetailAPIFormat(data);
//        setForm();
       $.get("/api/v1/Candidate/?activity_id="+id+"&format=json&status__gt=0", function (data, status) {
        candidates = fromCandidateListAPIFormat(data.objects);
        setForm();
        initializePage();
    })
    })

}
getDate();
//setForm();
function fromVoteActDetailAPIFormat(data) {
    var result = {};
    result.id = data.id;
    result.name = data.name;
    result.description = data.description;
    result.key = data.key;
    result.act_pic = '';
    data.begin_vote = data.begin_vote.substring(0,10) + " " + data.begin_vote.substring(11);
    data.end_vote = data.end_vote.substring(0,10) + " " + data.end_vote.substring(11);
    result.start_time =  new Date(data.begin_vote.replace(/-/g,"/"));
    result.end_time = new Date(data.end_vote.replace(/-/g,"/"));
    result.status = data.status;
    return result;
}


function fromCandidateListAPIFormat(data) {
    var result = [];
    for (var i in data) {
        var _candidate = data[i];
        var candidate = {};
        candidate.name = _candidate.name;
        candidate.id = _candidate.key;
        candidate.votes = _candidate.votes;
        result.push(candidate);
    }
    return result;
}




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

function showButton(){
    var $beginBtn = $('<a class="btnBegin mycenter">投票开始！</a>');
    var $endBtn = $('<a class="btnEnd mycenter">结束投票！</a>');
    var $pubBtn = $('<a class="btnPub mycenter">发布结果！</a>');
    var $bonusBtn = $('<a class="btnBegin mycenter">我要抽奖！</a>');
    var $editBtn = $('<a class="btnPub mycenter">编辑活动</a>');
    var beginhref = '/vote/begin/'+id+'/';
    var endhref = '/vote/end/'+id+'/';
    var pubhref = '/vote/pub/'+id+'/';
    var edithref = '/vote/edit/'+id+'/';
    var bonushref = '/vote/bonus/'+id+'/';
    $beginBtn.attr('href',beginhref);
    $endBtn.attr('href', endhref);
    $pubBtn.attr('href', pubhref);
    $bonusBtn.attr('href', '');
    $editBtn.attr('href', edithref);
    var $contain = $('#showButton');
    $contain.children().remove();
    switch (getSmartStatus(vote_activity)){
        case '未发布':
            $contain.append($editBtn);
            break;
        case '投票尚未开始':
            $contain.append($beginBtn);
            break;
        case '正在投票':
            $contain.append($endBtn);
            break;
        case '投票已结束':
            $contain.append($pubBtn);
            break;
        case '结果已发布':
            $contain.append($bonusBtn);
            break;
        default :
            break;
    };

}

function download_data(){
    window.location.href = '/vote/detail/download/'+id+'/';
}
function initializeResultPage(){

}
function initializePage(){
    showButton();
}