
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

function initializeForm(activity) {

    if (!activity.id) {
        $('#input-name').val('');
        $('#remain_tickets').remove();
    }
    else
    {
        var key;
        for (key in keyMap) {
            actionMap[keyMap[key]]($('#input-' + key), activity[key]);
        }

        if (activity.place == '大礼堂')
        {
            multiDistricts.remove();
            xinqingAllocation.remove();
            $('#input-total_tickets').val(activity.districts[0].total_tickets);
            $('#input-remain_tickets').val(activity.districts[0].remain_tickets);
        }
        else if (activity.place == '综体')
        {
            singleDistrict.remove();
            multiDistricts.appendTo('#tickets_setting');
            $('#remain_tickets').remove();
            var list = $('#district-list');
            var list_body = list.children('tbody');
            list.children('thead').children().children()[3].innerHTML = '票余量';
            list.children('tbody').children().remove();
            for (var i = 0; i < activity.districts.length; i++)
            {
                list_body.append($('<tr />').append($('<th />').text(i + 1))
                                            .append($('<th />').text(activity.districts[i].name))
                                            .append($('<th />').text(activity.districts[i].total_tickets))
                                            .append($('<th />').text(activity.districts[i].remain_tickets))
                                )
            }
            list.parent().children('a').remove();
        }
        else {
            singleDistrict.remove();
            xinqingAllocation.appendTo('#tickets_setting');
            $('#remain_tickets').remove();
            var table = $("#seat_plan");
            for (var i = 1; i <= rows; i++) {
                var tr = $("<tr>");
                var td1 = $("<td>");
                var div = $("<div>");

                div.attr({ class: "checkbox", style: "margin-right:30px" });

                var label = $("<label>");

                var input = $("<input>");
                input.attr({id: "check_row" + i, name: "row" + i, onchange: "check(" + i + ")",
                    type: "checkbox", value: "x", disabled: 'True'});
                input.appendTo(label);

                var span = $("<span>");
                span[0].innerHTML = "第" + i + "排";
                span.appendTo(label);

                label.appendTo(div);
                div.appendTo(td1);
                td1.appendTo(tr);

                var td2 = $("<td>");
                td2.attr("id", "row" + i);

                for (var j = 1; j <= cols; j++) {
                    var s = $("<span>");
                    s.attr("class", "seat unselected");
                    s.appendTo(td2);
                }
                td2.appendTo(tr);

                table.append(tr);
            }
            for (var i in activity.selectedRows)
            {
                $('#check_row' + (- -i + 1)).attr('checked', 'True');
                $('#row' + (- -i + 1)).children().removeClass('unselected').addClass('selected');
            }
        }
    }
    if (typeof activity.checked_tickets !== 'undefined') {
        initialProgress(activity.checked_tickets, activity.ordered_tickets, activity.total_tickets);
    }
    curstatus = activity.status;
    lockByStatus(curstatus, activity.book_start, activity.start_time, activity.end_time);
}

function check_percent(p) {
    if (p > 100.0) {
        return 100.0;
    } else {
        return p;
    }
}

function checktime(){
    var actstart = new Date($("#input-start_time").val());
    var actend = new Date($("#input-end_time").val());
    var bookstart = new Date($("#input-book_start").val());
    var bookend = new Date($("#input-book_end").val());
    var now = new Date();
    console.log(now);
    if(curstatus == 0){
        if(bookstart < now){
            $('#input-book_start').popover({
                    html: true,
                    placement: 'top',
                    title:'',
                    content: '<span style="color:red;">“订票开始时间”应晚于“当前时间”</span>',
                    trigger: 'focus',
                    container: 'body'
            });
            $('#input-book_start').focus();
            return false;
        }

        if(bookend < bookstart){
            $('#input-book_end').popover({
                html: true,
                placement: 'top',
                title:'',
                content: '<span style="color:red;">“订票结束时间”应晚于“订票开始时间”</span>',
                trigger: 'focus',
                container: 'body'
            });
            $('#input-book_end').focus();
            return false;
        }
    }
    if(actstart < bookend){
        $('#input-start_time').popover({
                html: true,
                placement: 'top',
                title:'',
                content: '<span style="color:red;">“活动开始时间”应晚于“订票结束时间”</span>',
                trigger: 'focus',
                container: 'body'
        });
         $('#input-start_time').focus();
        return false;
    }
    if(actend < actstart){
        $('#input-end_time').popover({
            html: true,
            placement: 'top',
            title:'',
            content: '<span style="color:red;">“活动结束时间”应晚于“活动开始时间”</span>',
            trigger: 'focus',
            container: 'body'
        });
         $('#input-end_time').focus();
        return false;
    }
    return true;
}

function initialProgress(checked, ordered, total) {
    $('#tickets-checked').css('width', check_percent(100.0 * checked / total) + '%')
        .tooltip('destroy').tooltip({'title': '已检入：' + checked + '/' + ordered + '=' + (100.0 * checked / ordered).toFixed(2) + '%'});
    $('#tickets-ordered').css('width', check_percent(100.0 * (ordered - checked) / total) + '%')
        .tooltip('destroy').tooltip({'title': '订票总数：' + ordered + '/' + total + '=' + (100.0 * ordered / total).toFixed(2) + '%' + '，其中未检票：' + (ordered - checked) + '/' + ordered + '=' + (100.0 * (ordered - checked) / ordered).toFixed(2) + '%'});
    $('#tickets-remain').css('width', check_percent(100.0 * (total - ordered) / total) + '%')
        .tooltip('destroy').tooltip({'title': '余票：' + (total - ordered) + '/' + total + '=' + (100.0 * (total - ordered) / total).toFixed(2) + '%'});
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
    if (typeof candidate.pic === 'undefined') candidate.pic = '';
    $tds.eq(1).children('img').attr('src', candidate.pic);
    if (candidate.pic != ''){
       $tds.eq(1).children('img').css('display', 'inline');
       $tds.eq(1).children('span').remove();
    }
    $tds.eq(2).children('input').val(candidate.name);
    $tds.eq(3).children('input').val(candidate.description);
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
    var $img = $(node).parent().children('img');
    $(node).remove();
    $img.css('display', 'inline');
}

function uploadImgClick(node){
    var $input = $(node).parent().children('input');
    $input.click();
}

function putCandidateImg(node){
    var $img = $(node).parent().children('img');
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
    var $trs = $('#candidate-list tbody').children('tr');
    vote_activity.candidates = [];
    for (var i = 0; i < $trs.length; i++){
        vote_activity.candidates.push(getCandidate($trs.eq(i)));
    }
}

function setForm(){
    $('#input-name').val(vote_activity.name);
    $('#input-key').val(vote_activity.key);
    $('#input-start_time').val(vote_activity.start_time);
    $('#input-end_time').val(vote_activity.end_time);
    $('#poster').attr('src',vote_activity.act_pic);
    $('#input-description').val(vote_activity.description);
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
    var $key = $('<td style="vertical-align:middle"/>').html($tbody.children().length + 1);
    var $img = $('<img width="100" src="" onclick="uploadImgClick(this)" style="cursor:pointer;display:none"/>');
    var $upicon = $('<span class="glyphicon glyphicon-circle-arrow-up gbtn" onclick="uploadIconClick(this)"></span>');
    var $input = $('<input style="display: none" type="file" accept="image/*" onchange="putCandidateImg(this)" />');
    var $imgtd = $('<td style="vertical-align:middle"/>').append($img).append($upicon).append($input);
    var $name = $('<td style="vertical-align:middle"/>').append($('<input type="text" class="form-control" placeholder="姓名"/>'));
    var $descript = $('<td style="vertical-align:middle"/>').append($('<input type="text" class="form-control" placeholder="候选人描述"/>'));
    var $deleteicon = $('<span class="glyphicon glyphicon-trash gbtn" onclick="deleteCandidate(this)"></span>');
    var $editicon = $('<span class="glyphicon glyphicon-pencil gbtn" data-toggle="modal" data-target="#candidate_detail" onclick="launchModal(this)"></span>');
    var $action = $('<td style="vertical-align:middle"/>').append($deleteicon).append($editicon);
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
        setCandKey($tbody.children().eq(i), i);
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
    result.act_pic = '/static1/img/default.png/';
    result.candidates = [];
    return result;
}


function fromCandidateListAPIFormat(data) {
    var result = [];
    for (i in data) {
        var _candidate = data[i];
        var candidate = {};
        candidate.no = _candidate.key;
        candidate.pic = '';
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
        })
    })
}


if (typeof id != 'undefined' && id != '') { getData(); }


function toCandidateListAPIFormat() {
    var result = [];
    for (var i in vote_activity.candidates) {
        var _candidate = vote_activity.candidates[i];
        var Candidate = {};
        Candidate['activity_id'] = '/api/v1/VoteAct/'+id+'/';
        Candidate['name'] = _candidate.name;
        Candidate['description'] = _candidate.description;
        Candidate['key'] = _candidate.no;
        Candidate['votes'] = 0;
        Candidate['status'] = 1;
        result.push(Candidate);
    }
    return result;
}


function toVoteActDetailAPIFormat(IsSave) {
    var result = {};
    result['name'] = vote_activity.name;
    result['description'] = vote_activity.description;
    result['key'] = vote_activity.key;
    result['config'] = 1;
    result['begin_vote'] = vote_activity.start_time;
    result['end_vote'] = vote_activity.end_time;
    if (!IsSave) {
        result['status'] = 1;
    }
    return result;
}


function saveActivity() {
    getForm();
    var Candidates = '{"objects":'+JSON.stringify(toCandidateListAPIFormat())+'}';
    var VoteAct = JSON.stringify(toVoteActDetailAPIFormat(true));
    $.ajax({
        type: 'PATCH',
        url: '/api/v1/VoteAct/'+id+'/?format=json',
        contentType: 'application/json',
        data: VoteAct,
        success: function() {
            $.ajax({
                type: 'DELETE',
                url: '/api/v1/Candidate/?format=json&activity_id='+id,
                contentType: 'application/json',
                success: function() {
                    $.ajax({
                        type: 'PATCH',
                        url: '/api/v1/Candidate/?format=json',
                        contentType: 'application/json',
                        data: Candidates,
                        error: function() {alert('create candidates failed')}
                    })
                },
                error: function() {alert('delete candidate failed')}
            })
        },
        error: function() {alert('save VoteAct failed')}
    })
}

function m_publishActivity() {
    getForm();
    var Candidates = '{"objects":'+JSON.stringify(toCandidateListAPIFormat())+'}';
    var VoteAct = JSON.stringify(toVoteActDetailAPIFormat(false));
    $.ajax({
        type: 'PATCH',
        url: '/api/v1/VoteAct/'+id+'/?format=json',
        contentType: 'application/json',
        data: VoteAct,
        success: function() {
            $.ajax({
                type: 'DELETE',
                url: '/api/v1/Candidate/?format=json&activity_id='+id,
                contentType: 'application/json',
                success: function() {
                    $.ajax({
                        type: 'PATCH',
                        url: '/api/v1/Candidate/?format=json',
                        contentType: 'application/json',
                        data: Candidates,
                        error: function() {alert('create candidates failed')}
                    })
                },
                error: function() {alert('delete candidate failed')}
            })
        },
        error: function() {alert('save VoteAct failed')}
    })
}

function upload_act_img(){
    move_pics_to_form();
    $('#act_img_form').attr('action', '/vote/uploadImg/'+id+'/');
    var $submit = $('#act_img_submit');
    $submit.click();
}

function move_pics_to_form(){
    var $inputs = $('input[type="file"]');
    $('#act_img_form').append($inputs);
    $('#act_img_form #modal-pic').remove();
}