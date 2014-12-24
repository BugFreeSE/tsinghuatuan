var stu_num_list = '';
$(document).ready(function () {

    $.get("/api/v1/VoteLog/?format=json&limit=0&activity_id=" + id, function (data, status) {
        var i;
        for (i in data.objects) {
            stu_num_list += ("<div>" + data.objects[i].stu_id + "</div>");
        }
        $('#textMachine').append(stu_num_list);
        var slotmachine = $('#textMachine').slotMachine({delay: 350, active: 0})
        $('#slotMachineButtonShuffle').click(function () {
            slotmachine.shuffle(5, function () {
                result += ' ' + $('#textMachine').children().children().eq(slotmachine.active + 1).html();
                setLotteryResult();
            })

        });
        $.get("/api/v1/VoteAct/" + id + "/?format=json", function (data, status) {
            $('#vote_title').html(data.name + ' 抽奖');
        })
    })
    $('#slotMachineButtonSave').click(function () {
        saveClicked();
    });
})

function saveResult() {
    t = {};
    t['bonus_result'] = result;
    $.ajax({
        type: 'PATCH',
        url: '/api/v1/VoteAct/' + id + '/?format=json',
        contentType: 'application/json',
        data: JSON.stringify(t),
        success: function () {
            setTimeout(function () {
                location.href = '/vote/list'
            }, 5000);
        }
    })
}

function saveClicked() {
    t = {};
    t['bonus_result'] = result;
    $.ajax({
        type: 'PATCH',
        url: '/api/v1/VoteAct/' + id + '/?format=json',
        contentType: 'application/json',
        data: JSON.stringify(t),
        success: function () {
            $('div.informer').fadeIn(800, function () {
        setTimeout(function () {
            $('div.informer').fadeOut(1000, function () {
                location.href = '/vote/list'
            });
        }, 1000);
    });
        }
    })
}

function setLotteryResult() {
    var res = result.split(" ");
    $("#lottery_result").children().remove();
    for (var i in res){
        if (res[i] && res[i] != ''){
            var $li = $('<li>').html(res[i]);
            $("#lottery_result").append($li);
        }
    }
}