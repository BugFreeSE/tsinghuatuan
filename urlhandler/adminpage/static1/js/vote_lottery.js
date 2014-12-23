var stu_num_list = [];
$(document).ready(function(){
    $.get("/api/v1/VoteLog/?format=json&limit=0&activity_id="+id, function(data, status){
        var i;
        for (i in data.objects) {
            stu_num_list.push(data.objects[i].stu_id);
        }
        $('#random_number').text(stu_num_list[0]);
    })
})