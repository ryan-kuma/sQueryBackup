var host = "http://172.0.2.1:8088";

//authentication认证
(function(){
    $.ajax({
        method: "post",
        url: host + "/Authentication",
        dataType: "json",
        // xhrFields:{
    //     withCredentials: true
        // },
        data: {}
     }).done(function(result){
        if(result.status==200){
        
        }
     });

})();

//输入sql
$(document).on("click",".icon-search", function(){
	var sqltext = $("#input-sql").val().trim();
    var msg = {"sqltext":sqltext};
    if (!sqltext) {
        $(".span-message").text("输入信息为空");
        return;
    }
	$.ajax({
        method: "post",
        url: host + "/search",
        dataType: "json",
        data: msg
    }).done(function(result){
        console.log(result);
        if (result.status == 200) {
            $(".span-message").text("get data");
            var getData = result.result;
            console.log(getData[0]);
        } else {
            $(".span-message").text("can't get data");
        }
    });
});
