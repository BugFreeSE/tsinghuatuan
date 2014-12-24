var stu_num_list = '';
$(document).ready(function(){

    $.get("/api/v1/VoteLog/?format=json&limit=0&activity_id="+id, function(data, status){
        var i;
        for (i in data.objects) {
            stu_num_list += ("<div>"+data.objects[i].stu_id+"</div>");
        }
        $('#textMachine').append(stu_num_list);
        var slotmachine = $('#textMachine').slotMachine({delay: 350, active: 0})
        $('#slotMachineButtonShuffle').click(function () {
            slotmachine.shuffle(5, function(){
                result += ' ' + $('#textMachine').children().children().eq(slotmachine.active+1).html();
            })
        });
        $.get("/api/v1/VoteAct/"+id+"/?format=json", function(data, status){
            $('.content h1').html(data.name+' 抽奖')
        })
    })
    $('#slotMachineButtonSave').click(function () {
        t = {};
        t['bonus_result'] = result;
        $.ajax({
            type: 'PATCH',
            url: '/api/v1/VoteAct/'+id+'/?format=json',
            contentType: 'application/json',
            data: JSON.stringify(t),
            success: function () {
                setTimeout(function(){location.href='/vote/list'},5000);
            }
        })
    })

})