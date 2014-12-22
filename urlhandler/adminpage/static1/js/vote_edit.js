
var singleDistrict = $('#total_tickets');
var multiDistricts = $('#district_allocation');
var xinqingAllocation = $('#xinqing_allocation');
selected_row = [false,false,false,false];

var dateInterfaceMap = {
    'year': 'getFullYear',
    'month': 'getMonth',
    'day': 'getDate',
    'hour': 'getHours',
    'minute': 'getMinutes'
}, actionMap = {
    'value': function(dom, value) {
        dom.val(value);
    },
    'text': function(dom, value) {
        dom.text(value);
    },
    'time': function(dom, value) {
        var str = '';
        var year = value.year.toString();
        var month = (value.month < 10 ? '0' : '') + value.month;
        var day = (value.day < 10 ? '0' : '') + value.day;
        var hour = (value.hour < 10 ? '0' : '') + value.hour;
        var minute = (value.minute < 10 ? '0' : '') + value.minute;
        str = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
        dom.val(str);
    }
}, keyMap = {
    'name': 'value',
//    'key': 'value',
    'description': 'value',
    'start_time': 'time',
    'end_time': 'time',
    'place': 'value',
    'book_start': 'time',
    'book_end': 'time',
//    'pic_url': 'value',
    'total_tickets': 'value'
//    'seat_status': 'value'
}, lockMap = {
    'value': function(dom, lock) {
        dom.prop('disabled', lock);
    },
    'text': function(dom, lock) {
        dom.prop('disabled', lock);
    },
    'time': function(dom, lock) {
        var parts = dom.children(), i, len, part;
        for (i = 0, len = parts.length; i < len; ++i) {
            part = $(parts[i]).children();
            if (part.attr('date-part')) {
                part.prop('disabled', lock);
            }
        }
        dom.prop('disabled', lock);
    }
};

var curstatus = 0;

function updateActivity(nact) {
    var key, key2, tdate;
    for (key in nact) {
        if (keyMap[key] == 'time') {
            activity[key] = {};
            tdate = new Date(nact[key])
            for (key2 in dateInterfaceMap) {
                activity[key][key2] = tdate[dateInterfaceMap[key2]]() + ((key2 == 'month') ? 1 : 0);
            }
        } else {
            activity[key] = nact[key];
        }
    }
}

function check_percent(p) {
    if (p > 100.0) {
        return 100.0;
    } else {
        return p;
    }
}


function changeView(id) {
    var opt = ['noscript', 'form', 'processing', 'result'], len = opt.length, i;
    for (i = 0; i < len; ++i) {
        $('#detail-' + opt[i]).hide();
    }
    $('#detail-' + id).show();
}

function showForm() {
    changeView('form');
}

function showProcessing() {
    changeView('processing');
}

function showResult() {
    changeView('result');
}

function setResult(str) {
    $('#resultHolder').text(str);
}

function appendResult(str) {
    var dom = $('#resultHolder');
    dom.text(dom.text() + str + '\r\n');
}

function lockForm() {
    var key;
    for (key in keyMap) {
        lockMap[keyMap[key]]($('#input-' + key), true);
    }
    $('#publishBtn').hide();
    $('#saveBtn').hide();
    $('#resetBtn').hide();
}

function lockByStatus(status, book_start, start_time, end_time) {
    // true means lock, that is true means disabled
    var statusLockMap = {
        // saved but not published
        '0': {
        },
        // published but not determined
        '1': {
            'name': true,
            'key': true,
            'place': function() {
                return (new Date() >= getDateByObj(start_time));
            },
            'book_start': true,
            'book_end': function() {
                return (new Date() >= getDateByObj(start_time));
            },
            'total_tickets': function() {
                return (new Date() >= getDateByObj(book_start));
            },
            'start_time': function() {
                return (new Date() >= getDateByObj(end_time));
            },
            'end_time': function() {
                return (new Date() >= getDateByObj(end_time));
            },
            'seat_status': function() {
                return (new Date() >= getDateByObj(book_start));
            }
        }
    }, key;
    for (key in keyMap) {
        var flag = !!statusLockMap[status][key];
        if (typeof statusLockMap[status][key] == 'function') {
            flag = statusLockMap[status][key]();
        }
        lockMap[keyMap[key]]($('#input-' + key), flag);
    }
//    showProgressByStatus(status, book_start);
    if (status >= 1) {
        $('#saveBtn').hide();
    } else {
        $('#saveBtn').show();
    }
    showPublishByStatus(status, end_time);
    showPubTipsByStatus(status);
}

function showProgressByStatus(status, book_start) {
    if ((status >= 1) && (new Date() >= getDateByObj(book_start))) {
        $('#progress-tickets').show();
    } else {
        $('#progress-tickets').hide();
    }
}

function showPublishByStatus(status, linetime) {
    if ((status >= 1) && (new Date() >= getDateByObj(linetime))) {
        $('#publishBtn').hide();
        $('#resetBtn').hide();
    } else {
        $('#resetBtn').show();
        $('#publishBtn').show();
    }
}

function showPubTipsByStatus(status){
    if(status < 1){
        $('#publishBtn').tooltip({'title': '发布后不能修改“活动名称”、“活动代称”和“订票开始时间”'});
        $('#saveBtn').tooltip({'title': '暂存后可以“继续修改”'});
    }
}

function getDateString(tmpDate) {
    return tmpDate.year + '-' + tmpDate.month + '-' + tmpDate.day + ' ' + tmpDate.hour + ':' + tmpDate.minute + ':00';
}

function getDateByObj(obj) {
    return new Date(obj.year, obj.month - 1, obj.day, obj.hour, obj.minute);
}

function wrapDateString(dom, formData, name) {
    var parts = dom.children(), i, len, tmpDate = {}, part;
    for (i = 0, len = parts.length; i < len; ++i) {
        part = $(parts[i]).children();
        if (part.attr('date-part')) {
            if (part.val().length == 0) {
                return false;
            } else {
                tmpDate[part.attr('date-part')] = parseInt(part.val());
            }
        }
    }
    formData.push({
        name: name,
        required: false,
        type: 'string',
        value: getDateString(tmpDate)
    });
    return true;
}

function beforeSubmit(formData, jqForm, options) {
    x = formData;
    var i, len, nameMap = {
        'name': '活动名称',
        'place': '活动地点',
        'description': '活动简介',
        'start_time': '活动开始时间',
        'end_time': '活动结束时间',
//        'total_tickets': '活动总票数',
//        'pic_url': '活动配图',
        'pic': '活动海报',
        'book_start': '订票开始时间',
        'book_end': '订票结束时间'
    };
    lackArray = []; dateArray = [

    ];
    for (i = 0, len = formData.length; i < len; ++i) {
        if (formData[i].name == 'pic' && activity.id)
        {
            continue;
        }
        if (!formData[i].value) {
            lackArray.push(nameMap[formData[i].name]);
            console.log(formData[i]);
        }
    }

    if (lackArray.length > 0) {
        setResult('以下字段是必须的，请补充完整后再提交：\r\n' + lackArray.join('、'));
        $('#continueBtn').click(function() {
            showForm();
        });
        showResult();
        return false;
    }
    if (activity.id) {
        formData.push({
            name: 'id',
            required: false,
            type: 'number',
            value: activity.id.toString()
        });
    }
    return true;
}

function beforePublish(formData, jqForm, options) {
    if (beforeSubmit(formData, jqForm, options)) {
        showProcessing();
        if (activity.id) {
            formData.push({
                name: 'id',
                required: false,
                type: 'number',
                value: activity.id.toString()
            });
        }
        formData.push({
            name: 'publish',
            required: false,
            type: 'number',
            value: '1'
        });
        return true;
    } else {
        return false;
    }
}

function submitResponse(data) {
    if (!data.error) {
//        updateActivity(data.activity);
//        initializeForm(activity);
        console.log(1);
        appendResult('成功');
    } else {
        appendResult('错误：' + data.error);
    }
    if (data.warning) {
        appendResult('警告：' + data.warning);
    }
    if (data.updateUrl) {
        $('#continueBtn').click(function() {
            window.location.href = data.updateUrl;
        });
    } else {
        $('#continueBtn').click(function() {
            showForm();
        });
    }

}

function submitError(xhr) {
    setResult('ERROR!\r\nStatus:' + xhr.status + ' ' + xhr.statusText + '\r\n\r\nResponseText:\r\n' + (xhr.responseText || '<null>'));
    $('#continueBtn').click(function() {
        showForm();
    });
}

function submitComplete(xhr) {
    showResult();
}

function publishActivity() {
    if(!$('#activity-form')[0].checkValidity || $('#activity-form')[0].checkValidity()){
        if(!checktime()) {
            return false;
        }
        if(file != undefined) {//对于用户新上传的文件检查是否为图片格式
            var x = file.type;
            if (x.charAt(0) != 'i' || x.charAt(1) != 'm') {
                $('#upLoadBtn').popover({
                    html: true,
                    placement: 'top',
                    title: '',
                    content: '<span style="color:red;">文件格式必须为图片</span>',
                    trigger: 'focus',
                    container: 'body'
                });
                $('#upLoadBtn').focus();
                return false;
            }
        }
        //if(file.type)
        showProcessing();
        setResult('');
        var options = {
            dataType: 'json',
            beforeSubmit: beforePublish,
            success: submitResponse,
            error: submitError,
            complete: submitComplete
        };
        $('#activity-form').ajaxSubmit(options);
        return false;
    } else {
        $('#saveBtn').click();
    }
    return false;
}

//initializeForm(activity);
showForm();

$('#activity-form').submit(function() {
    showProcessing();
    setResult('');
    var options = {
        dataType: 'json',
        beforeSubmit: beforeSubmit,
        success: submitResponse,
        error: submitError,
        complete: submitComplete
    };
    $(this).ajaxSubmit(options);
    return false;
}).on('reset', function() {
    initializeForm(activity);
    return false;
});

$('.form-control').on('focus', function() {var me = $(this); setTimeout(function(){me.select();}, 100)});

function check(n){
    var l = $("#row"+n).children().length;
    if ($("#check_row"+n)[0].checked == true) {
    //将座位选中
        for(var i = 0; i < l; i++){
            $($("#row"+n).children()[i]).removeClass("unselected");
            $($("#row"+n).children()[i]).addClass("selected");
        }
        selected_row[n-1] = true;
    }
    else {
        for(var i = 0; i < l; i++){
            $($("#row"+n).children()[i]).removeClass("selected");
            $($("#row"+n).children()[i]).addClass("unselected");
        }
        selected_row[n-1] = false;
    }
}

function getImgURL(node) {
    var imgURL = "";
    try{
        file = null;
        if(node.files && node.files[0] ){
            file = node.files[0];
        }else if(node.files && node.files.item(0)) {
            file = node.files.item(0);
        }
        //Firefox 因安全性问题已无法直接通过input[file].value 获取完整的文件路径
        try{
            //Firefox7.0
            imgURL =  file.getAsDataURL();
            //alert("//Firefox7.0"+imgRUL);
        }catch(e){
            //Firefox8.0以上
            imgRUL = window.URL.createObjectURL(file);
            //alert("//Firefox8.0以上"+imgRUL);
        }
     }catch(e){      //这里不知道怎么处理了，如果是遨游的话会报这个异常
        //支持html5的浏览器,比如高版本的firefox、chrome、ie10
        if (node.files && node.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                imgURL = e.target.result;
            };
            reader.readAsDataURL(node.files[0]);
        }
     }
    //imgurl = imgURL;
    //creatImg(imgRUL);
    $(node).attr('changed', 'true');
    return imgRUL;
}

function createImg(id, imgRUL){   //根据指定URL创建一个Img对象
    $(id).attr("src",imgRUL);
}

var defaultPic = "../../static1/img/default.png";


var vote_activity = {};
//var vote_activity = {
//    'id':0,
//    'name': '看蓝猫',
//    'key':'klm',
//    'start_time':'2014-12-01 9:40',
//    'end_time':'2014-12-01 9:40',
//    'act_pic':'../../static1/img/default.png/',
//    'description':'description',
//    'candidates':[
//        {
//            'no':1,
//            'pic':'',
//            'name':'hxr0',
//            'description':'des0'
//        },
//        {
//            'no':2,
//            'pic':'',
//            'name':'hxr1',
//            'description':'des1'
//        },
//        {
//            'no':3,
//            'pic':'',
//            'name':'hxr2',
//            'description':'des2'
//        }
//    ]
//}


function getCandidate($trNode){
    var candidate = {};
    var $tds = $($trNode).children();
    candidate.no = $tds.eq(0).html();
    candidate.pic = $tds.eq(1).children('img').attr('src');
    if (typeof candidate.pic === 'undefined') candidate.pic = '';
    candidate.name = $tds.eq(2).children().val();
    candidate.description = $tds.eq(3).children().val();
    return candidate;
}

function setCandidate(candidate, $trNode){
    var $tds = $($trNode).children();
    $tds.eq(0).html(candidate.no);
    if (typeof candidate.pic === 'undefined' || !candidate.pic) candidate.pic = '';
    $tds.eq(1).children('img').attr('src', candidate.pic);
    if (candidate.pic != ''){
       $tds.eq(1).children('img').css('display', 'inline');
       $tds.eq(1).children('span').remove();
    }
    $tds.eq(2).children('input').val(candidate.name);
    $tds.eq(3).children('textarea').val(candidate.description);
}

function setModalData(candidate){
    $('#modal_no').text(candidate.no);
    var img = candidate.pic;
    if (img === '') img = defaultPic;
    $('#modal-poster').attr('src', img);
    $('#modal_name').val(candidate.name);
    $('#modal_description').val(candidate.description);
}

function getModalData(){
    var img = $('#modal-poster').attr('src');
    var name = $('#modal_name').val();
    var description = $('#modal_description').val();
    if (img === defaultPic) img = "";
    var candidate = {};
    candidate.name = name;
    candidate.description = description;
    candidate.pic = img;
    return candidate;
}

function launchModal(node){
    var key = $(node).attr('key');
    var $trnode = $('#cand_'+key);
    $('#candidate_detail').attr('key', key);
    setModalData(getCandidate($trnode));
}

function returnFromModal(){
    var key = $('#candidate_detail').attr('key');
    var $trnode = $('#cand_'+key);
    setCandidate(getModalData(), $trnode);
}

function uploadIconClick(node){
    uploadImgClick(node);

}

function uploadImgClick(node){
    var $input = $(node).parent().children('input');
    $input.click();
}

function putCandidateImg(node){
    var $img = $(node).parent().children('img');
    var $span = $(node).parent().children('span');
    $span.remove();
    $img.css('display', 'inline');
    $img.attr('src', getImgURL(node));
}

function putModalImg(node){
    $('#modal-poster').attr('src', getImgURL(node));
}

function getForm(){
    vote_activity.name = $('#input-name').val();
    vote_activity.key = $('#input-key').val();
    vote_activity.start_time = $('#input-start_time').val();
    vote_activity.end_time = $('#input-end_time').val();
    vote_activity.act_pic = $('#poster').attr('src');
    vote_activity.description = $('#input-description').val();
    var str = $('#input-config').val();
    var n = 1;
    if (str != ''){n = parseInt(str)}
    vote_activity.config = n;
    var $trs = $('#candidate-list tbody').children('tr');
    vote_activity.candidates = [];
    for (var i = 0; i < $('#candidate-list tbody').children('tr').length; i++){
        vote_activity.candidates.push(getCandidate($trs.eq(i)));
    }
}

function setForm(){
    if (!validateStatus()) return;
    $('#input-name').val(vote_activity.name);
    $('#input-key').val(vote_activity.key);
    $('#input-start_time').val(vote_activity.start_time);
    $('#input-end_time').val(vote_activity.end_time);
    $('#poster').attr('src',vote_activity.act_pic);
    $('#input-description').val(vote_activity.description);
    $('#input-config').val(vote_activity.config);
    if (vote_activity.candidates.length != 0){
        $('#candidate-list tbody').children().remove();
    }
    for (var i in vote_activity.candidates){
        var c = vote_activity.candidates[i];
        var $tr = addEmptyCandidate();
        setCandidate(c, $tr);
    }
}

function addEmptyCandidate(){
    var $tbody = $('#candidate-list').children('tbody');
    var key = $tbody.children().length+1;
    var $tr = $('<tr />');
    var $key = $('<td style="vertical-align:middle;text-align: center"/>').html($tbody.children().length + 1);
    var $img = $('<img width="100" src="" onclick="uploadImgClick(this)" style="cursor:pointer;display:none"/>');
    var $upicon = $('<span class="glyphicon glyphicon-circle-arrow-up gbtn" onclick="uploadIconClick(this)"></span>');
    var $input = $('<input style="display: none" type="file" accept="image/*" onchange="putCandidateImg(this)" />');
    var $imgtd = $('<td style="vertical-align:middle;text-align: center"/>').append($img).append($upicon).append($input);
    var $name = $('<td style="vertical-align:middle"/>').append($('<input type="text" class="form-control" placeholder="姓名"/>'));
    var $descript = $('<td style="vertical-align:middle"/>').append($('<textarea type="text" class="form-control" placeholder="候选人描述" rows="1"/>'));
    var $deleteicon = $('<span class="glyphicon glyphicon-trash gbtn" onclick="deleteCandidate(this)"></span>');
    var $editicon = $('<span class="glyphicon glyphicon-pencil gbtn" data-toggle="modal" data-target="#candidate_detail" onclick="launchModal(this)"></span>');
    var $action = $('<td style="vertical-align:middle;text-align: center"/>').append($deleteicon).append($editicon);
    $tr.append($key).append($imgtd).append($name).append($descript).append($action);
    setCandKey($tr, key);
    $tbody.append($tr);
    return $tr;
}

addEmptyCandidate();

function setCandKey(trnode, key){
    trnode.attr('id', 'cand_'+key);
    var tds = trnode.children();
    tds.eq(0).html(key);
    tds.eq(1).children('input').attr('name', key);
    tds.children().attr('key', key);
}

function deleteCandidate(node)
{
    var key = $(node).attr('key');
    $('#cand_'+key).remove();
    var $tbody = $('#candidate-list').children('tbody');
    if ($tbody.children().length === 0)
    {
        addEmptyCandidate();
    }
    for (var i = 0; i < $tbody.children().length; i++)
    {
        setCandKey($tbody.children().eq(i), i+1);
    }
}

function fromVoteActDetailAPIFormat(data) {
    var result = {};
    result.id = data.id;
    result.name = data.name;
    result.description = data.description;
    result.key = data.key;
    data.begin_vote = data.begin_vote.substring(0,10) + " " + data.begin_vote.substring(11,16);
    data.end_vote = data.end_vote.substring(0,10) + " " + data.end_vote.substring(11,16);
    result.start_time =data.begin_vote.replace(/-/g,"/");
    result.end_time = data.end_vote.replace(/-/g,"/");
    result.act_pic = data.pic;
    result.config = data.config;
    result.status = data.status;
    result.candidates = [];
    return result;
}


function fromCandidateListAPIFormat(data) {
    var result = [];
    for (i in data) {
        var _candidate = data[i];
        var candidate = {};
        candidate.no = _candidate.key;
        candidate.pic = _candidate.pic;
        candidate.name = _candidate.name;
        candidate.description = _candidate.description;
        result.push(candidate);
    }
    return result;
}


function getData() {
    $.get("/api/v1/VoteAct/"+id+"/?format=json",function (data) {
        vote_activity = fromVoteActDetailAPIFormat(data);
        $.get("/api/v1/Candidate/?format=json&status__gt=0&activity_id="+id,function (data) {
            vote_activity.candidates = fromCandidateListAPIFormat(data.objects);
            setForm();
            initialize_nav();
        })
    })
}


if (typeof id != 'undefined' && id != -1) { getData(); }


function toCandidateListAPIFormat() {
    var result = [];
    for (var i in vote_activity.candidates) {
        var _candidate = vote_activity.candidates[i];
        var Candidate = {};
        Candidate['activity_id'] = '/api/v1/VoteAct/'+id+'/';
        Candidate['name'] = _candidate.name;
        Candidate['description'] = _candidate.description;
        Candidate['key'] = _candidate.no;
        Candidate['pic'] = _candidate.pic;
        Candidate['votes'] = 0;
        Candidate['status'] = 1;
        if (_candidate.name == '' && _candidate.description == '' && _candidate.pic == '') {
            continue;
        }
        result.push(Candidate);
    }
    return result;
}


function toVoteActDetailAPIFormat(IsSave) {
    var result = {};
    result['name'] = vote_activity.name;
    result['description'] = vote_activity.description;
    result['key'] = vote_activity.key;
    result['config'] = vote_activity.config;
    if (vote_activity.start_time != '')
        result['begin_vote'] = vote_activity.start_time;
    else
        result['begin_vote'] = null;
    if (vote_activity.end_time != '')
        result['end_vote'] = vote_activity.end_time;
    else
        result['end_vote'] = null;
    if (!IsSave) {
        result['status'] = 1;
    }
    else {
        result['status'] = 0;
    }
    return result;
}


function saveActivity() {
    showProcessing();
    getForm();
    var Candidates = '{"objects":'+JSON.stringify(toCandidateListAPIFormat())+'}';
    var VoteAct = JSON.stringify(toVoteActDetailAPIFormat(true));
    if (id != -1) {
        $.ajax({
            type: 'PATCH',
            url: '/api/v1/VoteAct/' + id + '/?format=json',
            contentType: 'application/json',
            data: VoteAct,
            success: function () {
                $.ajax({
                    type: 'DELETE',
                    url: '/api/v1/Candidate/?format=json&activity_id=' + id,
                    contentType: 'application/json',
                    success: function () {
                        $.ajax({
                            type: 'PATCH',
                            url: '/api/v1/Candidate/?format=json',
                            contentType: 'application/json',
                            data: Candidates,
                            success: function () {
                                upload_act_img();
                                setResult('活动暂存成功!');
                                showResult();
                            },
                            error: function () {
                                setResult('创建候选人失败！');
                                showResult();
                            }
                        })
                    },
                    error: function () {
                        setResult('删除候选人失败！');
                        showResult();
                    }
                })
            },
            error: function () {
                setResult('保存活动失败！');
                showResult();
            }
        })
    }
    else {
        $.ajax({
            type: 'POST',
            url: '/api/v1/VoteAct/?format=json',
            contentType: 'application/json',
            data: VoteAct,
            success: function () {
                id = - -arguments[2].getResponseHeader('Location').split('/').splice(-2,1).pop();
                var Candidates = '{"objects":'+JSON.stringify(toCandidateListAPIFormat())+'}';
                $.ajax({
                    type: 'PATCH',
                    url: '/api/v1/Candidate/?format=json',
                    contentType: 'application/json',
                    data: Candidates,
                    success: function () {
                        upload_act_img();
                        setResult('活动暂存成功!');
                        showResult();
                    },
                    error: function () {
                        setResult('create candidates failed');
                        showResult();
                    }
                })
            },
            error: function () {
                setResult('save VoteAct failed');
                showResult();
            }
        })
    }
}

function confirmPublish(){
    showProcessing();
    getForm();
    var info = validatePage();
    if (info != ''){
        setResult(info);
        showResult();
        return;
    }
    $('#confirmModal').modal('toggle');
    $('#confirm-btn').click(function(){
        m_publishActivity();
        $('#confirmModal').modal('hide');
    })
    $('#cancel-confirm').click(function(){
        showForm();
    })

}

function m_publishActivity() {

    var VoteAct = JSON.stringify(toVoteActDetailAPIFormat(false));
    if (id != -1) {
        var Candidates = '{"objects":'+JSON.stringify(toCandidateListAPIFormat())+'}';
        $.ajax({
            type: 'PATCH',
            url: '/api/v1/VoteAct/' + id + '/?format=json',
            contentType: 'application/json',
            data: VoteAct,
            success: function () {
                $.ajax({
                    type: 'DELETE',
                    url: '/api/v1/Candidate/?format=json&activity_id=' + id,
                    contentType: 'application/json',
                    success: function () {
                        var Candidates = '{"objects":'+JSON.stringify(toCandidateListAPIFormat())+'}';
                        $.ajax({
                            type: 'PATCH',
                            url: '/api/v1/Candidate/?format=json',
                            contentType: 'application/json',
                            data: Candidates,
                            success: function () {
                                upload_act_img();
                                setResult('活动发布成功!');
                                $('#continueBtn').remove();
                                showResult();
                            },
                            error: function () {
                                setResult('创建候选人失败！');
                                showResult();
                            }
                        })
                    },
                    error: function () {
                        setResult('清除候选人失败！');
                        showResult();
                    }
                })
            },
            error: function () {
                setResult('保存活动失败！');
                showResult();
            }
        })
    }
    else {
        $.ajax({
            type: 'POST',
            url: '/api/v1/VoteAct/?format=json',
            contentType: 'application/json',
            data: VoteAct,
            success: function () {
                id = - -arguments[2].getResponseHeader('Location').split('/').splice(-2,1).pop();
                var Candidates = '{"objects":'+JSON.stringify(toCandidateListAPIFormat())+'}';
                $.ajax({
                    type: 'PATCH',
                    url: '/api/v1/Candidate/?format=json',
                    contentType: 'application/json',
                    data: Candidates,
                    success: function () {
                        upload_act_img();
                        setResult('活动发布成功!');
                        $('#continueBtn').remove();
                        showResult();
                    },
                    error: function () {
                        setResult('创建候选人失败！');
                        showResult();
                    }
                })
            },
            error: function () {
                setResult('保存活动失败！');
                showResult();
            }
        })
    }
}

function upload_act_img(){
    move_pics_to_form();
     $('#act_img_form').ajaxSubmit({
            url:'/vote/uploadImg/'+id+'/',
            contentType:"multipart/form-data",
            success: function(){
                $('#act_img_form input[type="file"]').remove();
            }
     });
}

function startWith(str1, str2){
  var reg=new RegExp("^"+str2);
  return reg.test(str1);
}

function move_pics_to_form(){
    var $inputs = $('input[type="file"][changed="true"]');
    $('#act_img_form').prepend($inputs);
    $('#act_img_form #modal-pic').remove();
}

function initializePage(){
    bind_validation();
    editNav();
    $('div.navbar-header a.navbar-brand').attr('href', '/vote/index/').css('cursor', 'pointer');
}

function validateStatus(){
    if (vote_activity.status >= 1){
        setResult('活动已发布，请不要对已发布的活动进行随便更改^_^');
        showResult();
        $('#continueBtn').remove();
        return false;
    }
    return true;
}

function editNav(){
    $('ul.navbar-nav li a[href="/list/"]').attr('href', '/vote/list/');
}

function bind_validation(){

    $('#input-name').change(function(){
        validate_action(validate_name(), $('#name-form'), $('#name-label'))
    });
    $('#input-key').change(function(){
        //validate_action(validate_key(), $('#key-form'), $('#key-label'))
        $.get("/api/v1/VoteAct/?format=json&status__gte=0&status_lt=2&key="+$('#input-key').val(),function (data) {
            var key_exist_flag = true;
            for (var i in data.objects) {
                if (data.objects[i].id != id) {
                    validate_action(validate_key('活动简称有重复'), $('#key-form'), $('#key-label'));
                    key_exist_flag = false;
                    break;
                }
            }
            if (data.meta.total_count==0||key_exist_flag) {
                validate_action(validate_key(''), $('#key-form'), $('#key-label'))
            }
        })
    });
    $('#input-start_time').change(function(){
        validate_action(validate_start(), $('#start-form'), $('#start-label'))
    });
    $('#input-end_time').change(function(){
        validate_action(validate_end(), $('#end-form'), $('#end-label'))
    })
    $('#input-config').change(function(){
        validate_action(validate_config(), $('#config-form'), $('#config-label'))
    })
}

function validate_key(str){
    if (typeof str === 'undefined'){
        return '';
    }
    return str;
}

function validate_name(){
    if ($('#input-name').val() === '') return '活动名称不能为空！';
    return ''
}
//'yyyy-mm-dd mm:ss'
function parseDate(str){
    var year = (str.substring(0,4));
    var month = parseInt(str.substring(5,7)) - 1;

    var day = (str.substring(8,10));
    var hour = (str.substring(11,13));
    var minute = (str.substring(14,16));
    return new Date(year, month, day, hour, minute);
}

function validate_start(){
    var now = new Date();
    var start = parseDate($('#input-start_time').val());
    if (start > now){
        return '';
    }
    else{
        return '开始时间应晚于当前时间！';
    }
}

function validate_end(){
    var start = parseDate($('#input-start_time').val());
    var end = parseDate($('#input-end_time').val());
    if (end > start){
        return '';

    }
    else{
        return '结束时间应晚于开始时间！';
    }
}

function validate_name(){
    return '';
}

function validate_action(r, $div, $label){
    if (r === ''){
        $div.removeClass('has-error');
        $div.addClass('has-success');
        $label.css('display', 'none');
    }
    else{
        $div.removeClass('has-success');
        $div.addClass('has-error');
        $label.text(r);
        $label.css('display', 'table');
    }
}

function validatePage(){
    var items = ['name', 'key', 'start', 'end', 'config'];
    var infos = {
        'name': validate_name(),
        'key': validate_key(''),
        'start': validate_start(),
        'end': validate_end(),
        'config': validate_config()
    }
    var divs = {
        'name': '#name-form',
        'key': '#key-form',
        'start': '#start-form',
        'end': '#end-form',
        'config': '#config-form'
    }
    var labels = {
        'name': '#name-label',
        'key': '#key-label',
        'start': '#start-label',
        'end': '#end-label',
        'config': '#config-label'
    }
    var result = '';
    for (var i in items){
        validate_action(infos[items[i]], $(divs[items[i]]), $(labels[items[i]]));
        var temp = infos[items[i]];
        if (temp != ''){
            result += temp + '\n';
        }
    }
    result += validateCandidates(vote_activity.candidates);
    return result;
}

function hideSaveBtn(){
    var now = new Date();
    var start = new Date($('#input-start_time').val());
    if (now > start){
        $('#saveBtn').remove();
    }
}

function validateCandidates(candidates){
    if (typeof candidates === 'undefined' || candidates.length == 0){
        return '没有候选人';
    }
    var result = '';
    for (var i in candidates){
        if (typeof candidates[i].name === 'undefined' || candidates[i].name === ''){
            result += '第' + (parseInt(i)+1) + '号候选人姓名为空\n'
        }
        if (typeof candidates[i].pic === 'undefined' || candidates[i].pic === ''){
            result += '第' + (parseInt(i)+1) + '号候选人图片为空\n'
        }
    }
    return result;
}

function isInteger( str )
{
    var regu = /^[-]{0,1}[0-9]{1,}$/;
    return regu.test(str);
};

function validate_config(){
    var config = $('#input-config').val();
    if (!isInteger(config)){
        return '投票数应为整数';
    }
    var n = parseInt(config);
    if (n <= 0){
        return '投票数应为正数';
    }
    return '';
}

function initialzeDateTimePicker(){
    $(function () {
        $('#datetimepicker1').datetimepicker({
            language: 'zh-CN',
            pick12HourFormat: false
        });
    });
    $(function () {
        $('#datetimepicker2').datetimepicker({
            language: 'zh-CN',
            pick12HourFormat: false
        });
    });
}

function initialize_nav(){
    var $a = $('.navbar-nav li.active a');
    var href = window.location.href;
    function endWith(str1, str2){
        if(str2==null||str1==""||str1.length==0||str2.length>str1.length)
            return false;
        if(str1.substring(str1.length-str2.length)==str2)
            return true;
        else
            return false;
    }
    if (endWith(href, 'add/')){
        $a.html('新建活动');
    }
    else {
        if (typeof vote_activity.name != 'undefined'){
            $a.html(vote_activity.name);
        }
    }
    $a.text()
}
$(document).ready(function(){

    initialzeDateTimePicker();
    initializePage();
    initialize_nav();
})