
(function(){
	$("#accurate-select-config").on("click",function(){
		$(".check-it").removeClass("check-it");
		$("#accurate-select-config").addClass("check-it");
		$(".div-search-config > div").hide();
        $(".div-accurate-select").show();
	});
	$("#complex-select-config").on("click",function(){
		$(".check-it").removeClass("check-it");
		$("#complex-select-config").addClass("check-it");
		$(".div-search-config > div").hide();
		$(".div-complex-select").show();
	});
	$("#range-select-config").on("click",function(){
		$(".check-it").removeClass("check-it");
		$("#range-select-config").addClass("check-it");
		$(".div-search-config > div").hide();
		$(".div-range-select").show();
	});
	$("#aggregate-select-config").on("click",function(){
		$(".check-it").removeClass("check-it");
		$("#aggregate-select-config").addClass("check-it");
		$(".div-search-config > div").hide();
		$(".div-aggregate-select").show();
	});
	$("#fuzzy-select-config").on("click",function(){
		$(".check-it").removeClass("check-it");
		$("#fuzzy-select-config").addClass("check-it");
		$(".div-search-config > div").hide();
		$(".div-fuzzy-select").show();
	});

    //首次认证
    $.ajax({
        method: "post",
        url: "/Authentication",
        dataType: "json",
        // xhrFields:{
    //     withCredentials: true
        // },
        data: {}
     }).done(function(result){
        if(result.status==200){
            $("head").data("public-key",result.publickey);
            console.log(result.publickey);
        } else{
            tipsConfirm("connection error");
        }
     });

})();

//精确查询页面点击链接ajax查询当前表所有列名
$(".div-accurate-select .input-table-name .icon-link").on("click",function(){
    var tableName = $(".div-accurate-select .input-table-name input").val().trim();
    console.log(tableName);
    $(".div-accurate-select .div-search-table .div-columns").empty();
    if(tableName == ""){
        tipsConfirm("Table name can\'t be empty");
    }
    else{
        var data = {};
        data.tablename = tableName;
        $.ajax({
            method: "post",
            url: "/showColumns",
            dataType: "json",
            data: data
        }).done(function(result){
            if (result.status == 200) {
                var getresult = JSON.parse(result.data);
                var encrydata = result.encrydata;
                var publickey = $("head").data("public-key");
                
                var decrypt = new JSEncrypt();
                decrypt.setPublicKey(publickey);
                var decryptedData = decrypt.decrypt(encrydata);

                console.log("encrydata="+encrydata);
                console.log("verifed="+decryptedData);
                var sha256 = CryptoJS.SHA256(result.data);
                sha256 = CryptoJS.enc.Base64.stringify(sha256);
                sha256 = sha256.slice(0,-1) + "A";
//                sha256 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(sha256));
                console.log("sha256="+sha256);

//                if (sha256.slice(0,-1) == decryptedData.slice(0,-1)) {
                if (sha256 == decryptedData) {
                    console.log("bingo");
                    columnNames = getresult.result;
                    console.log(columnNames);
                    $(".div-accurate-select .div-search-table .div-columns").empty();
                    $.each(columnNames,function(index,value){  //插入列名
                        var $column = $('<div class="checked"> \
                            <span class="column-name">' + value + '</span> \
                            <span class="column-equal" style="display: none;">=</span> \
                            <span class="column-value" contenteditable="true" style="display: none;"> \
                            </span> \
                        </div>');
    
                        $(".div-accurate-select .div-search-table .div-columns").append($column);
                    });

                    $(".footer .div-span-signcheck").text("success");
                } else {
                    $(".footer .div-span-signcheck").text("fail");
                    tipsConfirm("sign check fail");
                }



            }else if(result.status == 310){
                tipsConfirm("Can\'t find the table !")
            }else{
                tipsConfirm("Connection error !");
            }
        }).fail(function(result){
            tipsConfirm("Connection error !");
        });
    }
});

//复合查询页面点击链接ajax分别查询两个表所有列名
$(".div-complex-select .div-table1 .input-table-name .icon-link").on("click",function(){
    var table1Name = $(".div-complex-select .div-table1 .input-table-name input").val().trim();
    console.log(table1Name);
    $(".div-complex-select .div-table1 .div-columns").empty();
    if(table1Name == ""){
        tipsConfirm("the first table name can\'t be empty");
    }
    else{
        var data = {};
        data.tablename = table1Name;
        $.ajax({
            method: "post",
            url: "/showColumns",
            dataType: "json",
            data: data
        }).done(function(result){
            if (result.status == 200) {
                var getresult = JSON.parse(result.data);
                var encrydata = result.encrydata;
                var publickey = $("head").data("public-key");
                var decrypt = new JSEncrypt();
                decrypt.setPublicKey(publickey);
                var decryptedData = decrypt.decrypt(encrydata);
                var sha256 = CryptoJS.SHA256(result.data);
                sha256 = CryptoJS.enc.Base64.stringify(sha256);
                sha256 = sha256.slice(0,-1) + "A";

//                if (sha256.slice(0,-1) == decryptedData.slice(0,-1)) {
                if (sha256 == decryptedData) {
                    columnNames = getresult.result;
                    console.log(columnNames);
                    $(".div-complex-select .div-table1 .div-columns").empty();
                    $.each(columnNames,function(index,value){  //插入列名
                        var $column = $('<div> 	<span class="column-name">' + value + '</span> </div>');
                        $(".div-complex-select .div-table1 .div-columns").append($column);
                    });

                    $(".footer .div-span-signcheck").text("success");
                } else {
                    $(".footer .div-span-signcheck").text("fail");
                    tipsConfirm("sign check fail");
                }

            }else if(result.status == 310){
                tipsConfirm("can't find the table !")
            }else{
                tipsConfirm("Connection error !");
            }
        }).fail(function(result){
            tipsConfirm("Connection error !");
        });
    }
});
$(".div-complex-select .div-table2 .input-table-name .icon-link").on("click",function(){
    var table2Name = $(".div-complex-select .div-table2 .input-table-name input").val().trim();
    console.log(table2Name);
    $(".div-complex-select .div-table2 .div-columns").empty();
    if(table2Name == ""){
        tipsConfirm(" the second table name can\'t be empty");
    }
    else{
        var data = {};
        data.tablename = table2Name;
        $.ajax({
            method: "post",
            url: "/showColumns",
            dataType: "json",
            data: data
        }).done(function(result){
            if (result.status == 200) {
                var getresult = JSON.parse(result.data);
                var encrydata = result.encrydata;
                var publickey = $("head").data("public-key");
                var decrypt = new JSEncrypt();
                decrypt.setPublicKey(publickey);
                var decryptedData = decrypt.decrypt(encrydata);
                var sha256 = CryptoJS.SHA256(result.data);
                sha256 = CryptoJS.enc.Base64.stringify(sha256);
                sha256 = sha256.slice(0, -1) + "A";

//                if (sha256.slice(0,-1) == decryptedData.slice(0,-1)) {
                if (sha256 == decryptedData) {
                    columnNames = getresult.result;
                    console.log(columnNames);
                    $(".div-complex-select .div-table2 .div-columns").empty();
                    $.each(columnNames,function(index,value){  //插入列名
                        var $column = $('<div> 	<span class="column-name">' + value + '</span> </div>');

                        $(".div-complex-select .div-table2 .div-columns").append($column);
                    });

                    $(".footer .div-span-signcheck").text("success");
                } else {
                    $(".footer .div-span-signcheck").text("fail");
                    tipsConfirm("sign check fail");
                }
            
            
            }else if(result.status == 310){
                tipsConfirm("can't find the table !")
            }else{
                tipsConfirm("Connection error !");
            }
        }).fail(function(result){
            tipsConfirm("Connection error !");
        });
    }
});

//范围查询页面点击链接ajax查询当前表所有列名
$(".div-range-select .input-table-name .icon-link").on("click",function(){
    var tableName = $(".div-range-select .input-table-name input").val().trim();
    console.log(tableName);
    $(".div-range-select .div-search-table .div-columns").empty();
    if(tableName == ""){
        tipsConfirm("Table name can\'t be empty");
    }
    else{
        var data = {};
        data.tablename = tableName;
        $.ajax({
            method: "post",
            url: "/showColumns",
            dataType: "json",
            data: data
        }).done(function(result){
            if (result.status == 200) {
                //签名认证
                var getresult = JSON.parse(result.data);
                var encrydata = result.encrydata;
                var publickey = $("head").data("public-key");
                var decrypt = new JSEncrypt();
                decrypt.setPublicKey(publickey);
                var decryptedData = decrypt.decrypt(encrydata);
                var sha256 = CryptoJS.SHA256(result.data);
                sha256 = CryptoJS.enc.Base64.stringify(sha256);
                sha256 = sha256.slice(0, -1) + "A";

//                if (sha256.slice(0,-1) == decryptedData.slice(0,-1)) {
                if (sha256 == decryptedData) {
                    columnNames = getresult.result;
                    console.log(columnNames);
                    $(".div-range-select .div-search-table .div-columns").empty();
                    $.each(columnNames,function(index,value){  //插入列名
                        var $column = $('<div> \
                            <div id="div-div-columns"><span class="column-name">' + value + '</span> </div>  \
                            <div class="div-column-choice"> \
                            <div name="div-not-in-choice"> <span> not in (</span> <span class="column-value1" contenteditable="true" ></span><span>)</span></div> \
                            <div name="div-in-choice"> <span> in (</span> <span class="column-value1" contenteditable="true" ></span><span>)</span> </div>\
                            <div name="div-range-choice"><span>(</span><span class="column-value1" contenteditable="true" ></span><span>) ~ (</span><span class="column-value2" contenteditable="true"></span><span>)</span></div>\
                            </div> \
                        </div>');
                        $(".div-range-select .div-search-table .div-columns").append($column);
                    });
                } else {
                    $(".footer .div-span-signcheck").text("fail");
                    tipsConfirm("sign check fail");
                }
            
            }else if(result.status == 310){
                tipsConfirm("Can\'t find the table !")
            }else{
                tipsConfirm("Connection error !");
            }
        }).fail(function(result){
            tipsConfirm("Connection error !");
        });
    }
});

//聚集查询页面点击链接ajax查询当前表所有列名
$(".div-aggregate-select .input-table-name .icon-link").on("click",function(){
    var tableName = $(".div-aggregate-select .input-table-name input").val().trim();
    console.log(tableName);
    $(".div-aggregate-select .div-search-table .div-columns").empty();
    if(tableName == ""){
        tipsConfirm("Table name can\'t be empty");
    }
    else{
        var data = {};
        data.tablename = tableName;
        $.ajax({
            method: "post",
            url: "/showColumns",
            dataType: "json",
            data: data
        }).done(function(result){
            if (result.status == 200) {
                //签名认证
                var getresult = JSON.parse(result.data);
                var encrydata = result.encrydata;
                var publickey = $("head").data("public-key");
                var decrypt = new JSEncrypt();
                decrypt.setPublicKey(publickey);
                var decryptedData = decrypt.decrypt(encrydata);
                var sha256 = CryptoJS.SHA256(result.data);
                sha256 = CryptoJS.enc.Base64.stringify(sha256);
                sha256 = sha256.slice(0, -1) + "A";
                
//                if (sha256.slice(0,-1) == decryptedData.slice(0,-1)) {
                if (sha256 == decryptedData) {
                    columnNames = getresult.result;
                    console.log(columnNames);
                    $(".div-aggregate-select .div-search-table .div-columns").empty();
                    $.each(columnNames,function(index,value){  //插入列名
                        var $column = $('<div> \
                            <div id="div-div-columns"><span class="column-name">' + value + '</span> </div>  \
                            <div class="div-column-choice"> \
                                <div name="div-count-choice"><span>COUNT</span></div>\
                                <div name="div-sum-choice"> <span>SUM</span></div>\
                                <div name="div-avg-choice"> <span>AVG</span></div>\
                                <div name="div-max-choice"> <span>MAX</span></div>\
                                <div name="div-min-choice"> <span>MIN</span></div>\
                            </div> \
                        </div>').data("col-name", value);
                        $(".div-aggregate-select .div-search-table .div-columns").append($column);
                    });
                    
                    $(".footer .div-span-signcheck").text("success");
                } else {
                    $(".footer .div-span-signcheck").text("fail");
                    tipsConfirm("sign check fail");
                }

            }else if(result.status == 310){
                tipsConfirm("Can\'t find the table !")
            }else{
                tipsConfirm("Connection error !");
            }
        }).fail(function(result){
            tipsConfirm("Connection error !");
        });
    }
});

//模糊查询页面点击链接ajax查询当前表所有列名
$(".div-fuzzy-select .input-table-name .icon-link").on("click",function(){
    var tableName = $(".div-fuzzy-select .input-table-name input").val().trim();
    console.log(tableName);
    $(".div-fuzzy-select .div-search-table .div-columns").empty();
    if(tableName == ""){
        tipsConfirm("Table name can\'t be empty");
    }
    else{
        var data = {};
        data.tablename = tableName;
        $.ajax({
            method: "post",
            url: "/showColumns",
            dataType: "json",
            data: data
        }).done(function(result){
            if (result.status == 200) {
                 //签名认证
                 var getresult = JSON.parse(result.data);
                 var encrydata = result.encrydata;
                 var publickey = $("head").data("public-key");
                 var decrypt = new JSEncrypt();
                 decrypt.setPublicKey(publickey);
                 var decryptedData = decrypt.decrypt(encrydata);
                 var sha256 = CryptoJS.SHA256(result.data);
                 sha256 = CryptoJS.enc.Base64.stringify(sha256);
                 sha256 = sha256.slice(0, -1) + "A";
                
                 
//                 if (sha256.slice(0,-1) == decryptedData.slice(0,-1)) {
                 if (sha256 == decryptedData) {
                    columnNames = getresult.result;
                    console.log(columnNames);
                    $(".div-fuzzy-select .div-search-table .div-columns").empty();
                    $.each(columnNames,function(index,value){  //插入列名
                        var $column = $('<div class="checked"> \
                            <span class="column-name">' + value + '</span> \
                            <span class="column-equal" style="display: none;"> like </span> \
                            <span class="column-value" contenteditable="true" style="display: none;"> \
                            </span> \
                        </div>');

                        $(".div-fuzzy-select .div-search-table .div-columns").append($column);
                    });

                    $(".footer .div-span-signcheck").text("success");
                } else {
                    $(".footer .div-span-signcheck").text("fail");
                    tipsConfirm("sign check fail");
                }


            }else if(result.status == 310){
                tipsConfirm("Can\'t find the table !")
            }else{
                tipsConfirm("Connection error !");
            }
            
        }).fail(function(result){
            tipsConfirm("Connection error !");
        });
    }
});

//精确查询显示结果
$(document).on("click",".div-accurate-select .div-search-table .btn-search",function(){
    var tableName = $(".div-accurate-select .input-table-name input").val().trim();
	console.log(tableName);
    if(tableName == ""){
        tipsConfirm("target table can\'t be empty");
    }
    else{
        var selectData = {};
        selectData.tablename = tableName;
        
        var arrColNames = [];
        var arrColConditons = [];

        $(".div-accurate-select .div-columns .checked").each(function(){
            var colName = $(this).children("span.column-name").text().trim();
            arrColNames.push(colName);
        });
        $(".div-accurate-select .div-columns div").each(function(){
            var colName = $(this).children("span.column-name").text().trim();
            var colConn = $(this).children("span.column-value").text().trim();
            if (colConn != "") {
                var colConn = colName + "=" + colConn;
                arrColConditons.push(colConn);
            }
        });
        if (arrColNames.length==0) {
            tipsConfirm("please check the columns you want !");
        } 
        else {
            selectData.colnames = JSON.stringify(arrColNames);
            selectData.colconditions = JSON.stringify(arrColConditons);

            var starttime = (new Date()).getTime();

            $.ajax({
                method: "post",
                url: "/accurateSelect",
                dataType: "json",
                data: selectData,
            }).done(function(result){
                if (result.status == 200) 
                {
                    //签名认证
                    var getresult = JSON.parse(result.data);
                    var encrydata = result.encrydata;
                    var publickey = $("head").data("public-key");
                    var decrypt = new JSEncrypt();
                    decrypt.setPublicKey(publickey);
                    var decryptedData = decrypt.decrypt(encrydata);
                    var sha256 = CryptoJS.SHA256(result.data);
                    sha256 = CryptoJS.enc.Base64.stringify(sha256);
                    sha256 = sha256.slice(0,-1) + "A";
                    
                    $(".table-data").empty();
       console.log("sha="+sha256);
                    console.log("dec="+decryptedData);

//                    if (sha256.slice(0,-1) == decryptedData.slice(0,-1)) {
                    if (sha256 == decryptedData) {
                        var getData = getresult.result;
                        var dataCount = getresult.count;
                        var sqlStmt = getresult.sqlstmt;

                        $.each(getData, function(index, value){
                            if (index == 0) {
                                var colnameArr = eval("("+value+")");
                                $(".table-data").append('<tr class="colname-data"></tr>');
                                $.each(colnameArr.colname, function(index, colName) {
                                    // console.log(colName);
                                    $(".colname-data").append('<th>'+colName+'</th>');
                                });
                            } else {
                                var $trRowData = $('<tr class=row-data></tr>');
                                var rowdataArr = eval("("+value+")");
                                $.each(rowdataArr.rowdata, function(index, colData){
                                    var $td = $('<td title="'+ colData + '">'+colData+'</td>');
                                    $trRowData.append($td);
                                });
                                $(".table-data").append($trRowData);
                            }
                        });

                        $(".div-limit-pages").empty();
                        $(".div-limit-pages").append('<div class="div-div-countpages">共有<span class="span-div-limit-count"></span>条记录</div>');
                        $(".div-limit-pages").append('<div class="div-div-showpages"></div>');
                        //重置分页
                        var pageCount = Math.ceil(dataCount/20);
                        $(".div-div-showpages").empty();
                        $(".div-div-showpages").append('<span class="span-div-limit-prevpage"><前页</span>');
                        
                        $(".div-div-showpages").append('<span class="this-page">1</span>');
                        if (pageCount > 1){
                            $(".div-div-showpages").append('<span class="span-page">2</span>');
                            $(".div-div-showpages").append('<span class="breakprev">...</span>');
                        }

                        for (var i = 3; i < 10; i++) {
                            if (i > pageCount) {
                                break;
                            } 
                            $(".div-div-showpages").append('<span class="span-page">'+i+'</span>');
                        }
                        
                    
                        if (pageCount > 10) {
                            $(".div-div-showpages").append('<span class="breaknext">...</span>');
                            // $(".div-div-showpages").append('<span class="span-page">'+(pageCount-1)+'</span>');
                            // $(".div-div-showpages").append('<span class="span-page">'+pageCount+'</span>');
                        } 

                        $(".div-div-showpages").append('<span class="span-div-limit-nextpage">后页></span>');
                    
                        $(".div-limit-pages").data("tablesql", sqlStmt);
                        $(".div-limit-pages").data("pageCount", pageCount);
                        $(".div-limit-pages .span-div-limit-count").text(dataCount);
                        console.log(sqlStmt);
                        console.log(dataCount);
                        console.log(dataCount/20);
                        
                        $(".footer .div-span-signcheck").text("success");
                    } else {
                        $(".footer .div-span-signcheck").text("fail");
                        tipsConfirm("sign check fail");
                    }

                } else if (result.status == 310) {
                    $(".table-data").empty();
                    $(".div-limit-pages").empty();
                    $(".div-limit-pages").append('<div class="div-div-countpages">共有<span class="span-div-limit-count">0</span>条记录</div>');
                    $(".div-limit-pages").append('<div class="div-div-showpages"></div>');
                    tipsConfirm("table "+ tableName +" is empty !");
                } else {
                    tipsConfirm("can't get data !");
                }

                var endtime = (new Date()).getTime();
                var responseTimeMs = endtime - starttime; 
                $(".footer .div-span-time").text(responseTimeMs);
            });
        }
    }
});

//复合查询显示结果
$(document).on("click",".div-complex-select  .btn-search",function(){
    var table1Name = $(".div-div-complex-select .div-table1 .input-table-name input").val().trim();
    var table2Name = $(".div-div-complex-select .div-table2 .input-table-name input").val().trim();
    var joinCondition = $(".div-div-complex-select .input-div-conditions  input").val().trim();
	console.log(table1Name);
    console.log(table2Name);
    console.log(joinCondition)
    if(table1Name == "" || table2Name == ""){
        tipsConfirm("Table name can\'t be empty");
    }
    else{
        var selectData = {};
        selectData.table1name = table1Name;
        selectData.table2name = table2Name;
        selectData.joincondition = joinCondition;
        
        var arrColNames = [];

        //table1的已选择列名
        $(".div-div-complex-select .div-table1 .div-columns .checked").each(function(){
            var colName = $(this).children("span.column-name").text().trim();
            arrColNames.push(table1Name + "." + colName);
        });

        //table2的已选择列名
        $(".div-div-complex-select .div-table2 .div-columns .checked").each(function(){
            var colName = $(this).children("span.column-name").text().trim();
            arrColNames.push(table2Name + "." + colName);
        });

        if (arrColNames.length==0) {
            tipsConfirm("Please check the columns you want !");
        } 
        else {
            selectData.colnames = JSON.stringify(arrColNames);

            console.log("selectdata="+selectData)

            var starttime = (new Date()).getTime();

            $.ajax({
                method: "post",
                url: "/complexSelect",
                dataType: "json",
                data: selectData,
            }).done(function(result){
                if (result.status == 200) 
                {
                    //签名认证
                    var getresult = JSON.parse(result.data);
                    var encrydata = result.encrydata;
                    var publickey = $("head").data("public-key");
                    var decrypt = new JSEncrypt();
                    decrypt.setPublicKey(publickey);
                    var decryptedData = decrypt.decrypt(encrydata);
                    var sha256 = CryptoJS.SHA256(result.data);
                    sha256 = CryptoJS.enc.Base64.stringify(sha256);
                    sha256 = sha256.slice(0, -1) + "A";
        
                    $(".table-data").empty();
  
//                    if (sha256.slice(0,-1) == decryptedData.slice(0,-1)) {
                    if (sha256 == decryptedData) {
                        var getData = getresult.result;
                        var dataCount = getresult.count;
                        var sqlStmt = getresult.sqlstmt;

                        $.each(getData, function(index, value){
                            if (index == 0) {
                                var colnameArr = eval("("+value+")");
                                $(".table-data").append('<tr class="colname-data"></tr>');
                                $.each(colnameArr.colname, function(index, colName) {
                                    // console.log(colName);
                                    $(".colname-data").append('<th>'+colName+'</th>');
                                });
                            } else {
                                var $trRowData = $('<tr class=row-data></tr>');
                                var rowdataArr = eval("("+value+")");
                                $.each(rowdataArr.rowdata, function(index, colData){
                                    var $td = $('<td title="'+ colData + '">'+colData+'</td>');
                                    $trRowData.append($td);
                                });
                                $(".table-data").append($trRowData);
                            }
                        });

                        $(".div-limit-pages").empty();
                        $(".div-limit-pages").append('<div class="div-div-countpages">共有<span class="span-div-limit-count"></span>条记录</div>');
                        $(".div-limit-pages").append('<div class="div-div-showpages"></div>');
                        //分页
                        var pageCount = Math.ceil(dataCount/20);
                        $(".div-div-showpages").empty();
                        $(".div-div-showpages").append('<span class="span-div-limit-prevpage"><前页</span>');
                        
                        $(".div-div-showpages").append('<span class="this-page">1</span>');
                        if (pageCount > 1){
                            $(".div-div-showpages").append('<span class="span-page">2</span>');
                            $(".div-div-showpages").append('<span class="breakprev">...</span>');
                        }

                        for (var i = 3; i < 10; i++) {
                            if (i > pageCount) {
                                break;
                            } 
                            $(".div-div-showpages").append('<span class="span-page">'+i+'</span>');
                        }
                        
                    
                        if (pageCount > 10) {
                            $(".div-div-showpages").append('<span class="breaknext">...</span>');
                            // $(".div-div-showpages").append('<span class="span-page">'+(pageCount-1)+'</span>');
                            // $(".div-div-showpages").append('<span class="span-page">'+pageCount+'</span>');
                        } 

                        $(".div-div-showpages").append('<span class="span-div-limit-nextpage">后页></span>');
                    
                        $(".div-limit-pages").data("tablesql", sqlStmt);
                        $(".div-limit-pages").data("pageCount", pageCount);
                        $(".div-limit-pages .span-div-limit-count").text(dataCount);

                        $(".footer .div-span-signcheck").text("success");
                    } else {
                        $(".footer .div-span-signcheck").text("fail");
                        tipsConfirm("sign check fail");
                    }
            

                } else if (result.status == 310) {
                    $(".table-data").empty();
                    $(".div-limit-pages").empty();
                    $(".div-limit-pages").append('<div class="div-div-countpages">共有<span class="span-div-limit-count">0</span>条记录</div>');
                    $(".div-limit-pages").append('<div class="div-div-showpages"></div>');
                    tipsConfirm("Data is empty !");
                } else {
                    tipsConfirm("Can't get data !");
                }
            
                var endtime = (new Date()).getTime();
                var responseTimeMs = endtime - starttime; 
                $(".footer .div-span-time").text(responseTimeMs);
            });
        }
    }
});

//范围查询显示结果
$(document).on("click",".div-range-select .div-search-table .btn-search",function(){
    var tableName = $(".div-range-select .input-table-name input").val().trim();
	console.log(tableName);
    if(tableName == ""){
        tipsConfirm("target table can\'t be empty");
    }
    else{
        var selectData = {};
        selectData.tablename = tableName;
        
        var arrColNames = [];
        var arrColConditons = [];

        $(".div-range-select .div-columns .checked").each(function(){
            var colName = $(this).children("span.column-name").text().trim();
            arrColNames.push(colName);
        });

        $(".div-range-select .div-columns div").each(function(){
            var colName = $(this).children("span.column-name").text().trim();
            var $choice = $(this).next(".div-column-choice").children(".choice-checked");
            if (!$choice.is(":empty")) {
                var choicename = $choice.attr("name");
                var colConn = "";
                if(choicename == "div-not-in-choice") {
                    var value1 = $choice.children(".column-value1").text().trim();
                    if (value1 != "") {
                        colConn = colName + " not in ( " + value1 + " )";
                    } else {
                        tipsConfirm("Please check your range choice about column "+colName);
                    }
                } else if (choicename == "div-in-choice") {
                    var value1 = $choice.children(".column-value1").text().trim();
                    if (value1 != "") {
                        colConn = colName + " in ( " + value1 + " )";
                    } else {
                        tipsConfirm("Please check your range choice about column "+colName);
                    }
                } else if (choicename == "div-range-choice") {
                    var value1 = $choice.children(".column-value1").text().trim();
                    var value2 = $choice.children(".column-value2").text().trim();
                    if ((value1 != "") && (value2 != "")) {
                        colConn = colName + " between ( " + value1 + " ) and ( " + value2 + " )";
                    } else {
                        tipsConfirm("Please check your range choice about column "+colName);
                    }
                }
                console.log("colconn="+colConn+"    name="+choicename);
    
                if (colConn != "") {
                    arrColConditons.push(colConn);
                }
            }
        });



        if (arrColNames.length==0) {
            tipsConfirm("please check the columns you want !");
        } 
        else {
            selectData.colnames = JSON.stringify(arrColNames);
            selectData.colconditions = JSON.stringify(arrColConditons);

            console.log("selectdata="+selectData)

            var starttime = (new Date()).getTime();

            $.ajax({
                method: "post",
                url: "/rangeSelect",
                dataType: "json",
                data: selectData,
            }).done(function(result){
                if (result.status == 200) 
                {
                    //签名认证
                    var getresult = JSON.parse(result.data);
                    var encrydata = result.encrydata;
                    var publickey = $("head").data("public-key");
                    var decrypt = new JSEncrypt();
                    decrypt.setPublicKey(publickey);
                    var decryptedData = decrypt.decrypt(encrydata);
                    var sha256 = CryptoJS.SHA256(result.data);
                    sha256 = CryptoJS.enc.Base64.stringify(sha256);
                    sha256 = sha256.slice(0, -1)+"A";
   
                    $(".table-data").empty();
                    
//                    if (sha256.slice(0,-1) == decryptedData.slice(0,-1)) {
                    if (sha256 == decryptedData) {
                        var getData = getresult.result;
                        var dataCount = getresult.count;
                        var sqlStmt = getresult.sqlstmt;

                        $.each(getData, function(index, value){
                            if (index == 0) {
                                var colnameArr = eval("("+value+")");
                                $(".table-data").append('<tr class="colname-data"></tr>');
                                $.each(colnameArr.colname, function(index, colName) {
                                    // console.log(colName);
                                    $(".colname-data").append('<th>'+colName+'</th>');
                                });
                            } else {
                                var $trRowData = $('<tr class=row-data></tr>');
                                var rowdataArr = eval("("+value+")");
                                $.each(rowdataArr.rowdata, function(index, colData){
                                    var $td = $('<td title="'+ colData + '">'+colData+'</td>');
                                    $trRowData.append($td);
                                });
                                $(".table-data").append($trRowData);
                            }
                        });

                        $(".div-limit-pages").empty();
                        $(".div-limit-pages").append('<div class="div-div-countpages">共有<span class="span-div-limit-count"></span>条记录</div>');
                        $(".div-limit-pages").append('<div class="div-div-showpages"></div>');
                        //分页
                        var pageCount = Math.ceil(dataCount/20);
                        $(".div-div-showpages").empty();
                        $(".div-div-showpages").append('<span class="span-div-limit-prevpage"><前页</span>');
                        
                        $(".div-div-showpages").append('<span class="this-page">1</span>');
                        if (pageCount > 1){
                            $(".div-div-showpages").append('<span class="span-page">2</span>');
                            $(".div-div-showpages").append('<span class="breakprev">...</span>');
                        }

                        for (var i = 3; i < 10; i++) {
                            if (i > pageCount) {
                                break;
                            } 
                            $(".div-div-showpages").append('<span class="span-page">'+i+'</span>');
                        }
                        
                    
                        if (pageCount > 10) {
                            $(".div-div-showpages").append('<span class="breaknext">...</span>');
                            // $(".div-div-showpages").append('<span class="span-page">'+(pageCount-1)+'</span>');
                            // $(".div-div-showpages").append('<span class="span-page">'+pageCount+'</span>');
                        } 

                        $(".div-div-showpages").append('<span class="span-div-limit-nextpage">后页></span>');
                    
                        $(".div-limit-pages").data("tablesql", sqlStmt);
                        $(".div-limit-pages").data("pageCount", pageCount);
                        $(".div-limit-pages .span-div-limit-count").text(dataCount);
                      
                        $(".footer .div-span-signcheck").text("success");
                    } else {
                        $(".footer .div-span-signcheck").text("fail");
                        tipsConfirm("sign check fail");
                    }
            

                } else if (result.status == 310) {
                    $(".table-data").empty();
                    $(".div-limit-pages").empty();
                    $(".div-limit-pages").append('<div class="div-div-countpages">共有<span class="span-div-limit-count">0</span>条记录</div>');
                    $(".div-limit-pages").append('<div class="div-div-showpages"></div>');
                    tipsConfirm("table "+ tableName +" is empty !");
                } else {
                    tipsConfirm("can't get data !");
                }

                var endtime = (new Date()).getTime();
                var responseTimeMs = endtime - starttime; 
                $(".footer .div-span-time").text(responseTimeMs);
            });
        }
    }
});

//聚合查询显示结果
$(document).on("click",".div-aggregate-select .div-search-table .btn-search",function(){
    var tableName = $(".div-aggregate-select .input-table-name input").val().trim();
	console.log(tableName);
    if(tableName == ""){
        tipsConfirm("target table can\'t be empty");
    }
    else{
        var selectData = {};
        selectData.tablename = tableName;
        
        var arrColNames = [];

        $(".div-aggregate-select .div-columns .checked").each(function(){
            var colName = $(this).children("span.column-name").text().trim();
            arrColNames.push(colName);
        });


        if (arrColNames.length==0) {
            tipsConfirm("please check the columns you want !");
        } 
        else {
            selectData.colnames = JSON.stringify(arrColNames);
           
            var starttime = (new Date()).getTime();

            $.ajax({
                method: "post",
                url: "/aggregateSelect",
                dataType: "json",
                data: selectData,
            }).done(function(result){
                if (result.status == 200) 
                {
                    //签名认证
                    var getresult = JSON.parse(result.data);
                    var encrydata = result.encrydata;
                    var publickey = $("head").data("public-key");
                    var decrypt = new JSEncrypt();
                    decrypt.setPublicKey(publickey);
                    var decryptedData = decrypt.decrypt(encrydata);
                    var sha256 = CryptoJS.SHA256(result.data);
                    sha256 = CryptoJS.enc.Base64.stringify(sha256);
                    sha256 = sha256.slice(0, -1) + "A";
     
                    $(".table-data").empty();
                    
//                    if (sha256.slice(0,-1) == decryptedData.slice(0,-1)) {
                    if (sha256 == decryptedData) {
                        var getData = getresult.result;

                        $.each(getData, function(index, value){
                            if (index == 0) {
                                var colnameArr = eval("("+value+")");
                                $(".table-data").append('<tr class="colname-data"></tr>');
                                $.each(colnameArr.colname, function(index, colName) {
                                    // console.log(colName);
                                    $(".colname-data").append('<th>'+colName+'</th>');
                                });
                            } else {
                                var $trRowData = $('<tr class=row-data></tr>');
                                var rowdataArr = eval("("+value+")");
                                $.each(rowdataArr.rowdata, function(index, colData){
                                    var $td = $('<td title="'+ colData + '">'+colData+'</td>');
                                    $trRowData.append($td);
                                });
                                $(".table-data").append($trRowData);
                            }
                        });

                        //清空分页
                        $(".div-limit-pages").empty();

                        $(".footer .div-span-signcheck").text("success");
                    } else {
                        $(".footer .div-span-signcheck").text("fail");
                        tipsConfirm("sign check fail");
                    }

                } else if (result.status == 310) {
                    $(".table-data").empty();
                    tipsConfirm("table "+ tableName +" is empty !");
                } else {
                    tipsConfirm("can't get data !");
                }

                var endtime = (new Date()).getTime();
                var responseTimeMs = endtime - starttime; 
                $(".footer .div-span-time").text(responseTimeMs);
            });
        }
    }
});

//模糊查询显示结果
$(document).on("click",".div-fuzzy-select .div-search-table .btn-search",function(){
    var tableName = $(".div-fuzzy-select .input-table-name input").val().trim();
	console.log(tableName);
    if(tableName == ""){
        tipsConfirm("target table can\'t be empty");
    }
    else{
        var selectData = {};
        selectData.tablename = tableName;
        
        var arrColNames = [];
        var arrColConditons = [];

        $(".div-fuzzy-select .div-columns .checked").each(function(){
            var colName = $(this).children("span.column-name").text().trim();
            arrColNames.push(colName);
        });

        $(".div-fuzzy-select .div-columns div").each(function(){
            var colName = $(this).children("span.column-name").text().trim();
            var colConn = $(this).children("span.column-value").text().trim();
            if (colConn != "") {
                var colConn = colName + " like '" + colConn+"'";
                arrColConditons.push(colConn);
            }
        });
        if (arrColNames.length==0) {
            tipsConfirm("please check the columns you want !");
        } 
        else {
            selectData.colnames = JSON.stringify(arrColNames);
            selectData.colconditions = JSON.stringify(arrColConditons);

            var starttime = (new Date()).getTime();

            $.ajax({
                method: "post",
                url: "/fuzzySelect",
                dataType: "json",
                data: selectData,
            }).done(function(result){
                if (result.status == 200) 
                {
                    //签名认证
                    var getresult = JSON.parse(result.data);
                    var encrydata = result.encrydata;
                    var publickey = $("head").data("public-key");
                    var decrypt = new JSEncrypt();
                    decrypt.setPublicKey(publickey);
                    var decryptedData = decrypt.decrypt(encrydata);
                    var sha256 = CryptoJS.SHA256(result.data);
                    sha256 = CryptoJS.enc.Base64.stringify(sha256);
                    sha256 = sha256.slice(0,-1)+"A";

                    $(".table-data").empty();
//                    if (sha256.slice(0,-1) == decryptedData.slice(0,-1)) {                   
                    if (sha256 == decryptedData) {                   
                        var getData = getresult.result;
                        var dataCount = getresult.count;
                        var sqlStmt = getresult.sqlstmt;


                        $.each(getData, function(index, value){
                            if (index == 0) {
                                var colnameArr = eval("("+value+")");
                                $(".table-data").append('<tr class="colname-data"></tr>');
                                $.each(colnameArr.colname, function(index, colName) {
                                    // console.log(colName);
                                    $(".colname-data").append('<th>'+colName+'</th>');
                                });
                            } else {
                                var $trRowData = $('<tr class=row-data></tr>');
                                var rowdataArr = eval("("+value+")");
                                $.each(rowdataArr.rowdata, function(index, colData){
                                    var $td = $('<td title="'+ colData + '">'+colData+'</td>');
                                    $trRowData.append($td);
                                });
                                $(".table-data").append($trRowData);
                            }
                        });

                        $(".div-limit-pages").empty();
                        $(".div-limit-pages").append('<div class="div-div-countpages">共有<span class="span-div-limit-count"></span>条记录</div>');
                        $(".div-limit-pages").append('<div class="div-div-showpages"></div>');
                        //分页
                        var pageCount = Math.ceil(dataCount/20);
                        $(".div-div-showpages").empty();
                        $(".div-div-showpages").append('<span class="span-div-limit-prevpage"><前页</span>');
                        
                        $(".div-div-showpages").append('<span class="this-page">1</span>');
                        if (pageCount > 1){
                            $(".div-div-showpages").append('<span class="span-page">2</span>');
                            $(".div-div-showpages").append('<span class="breakprev">...</span>');
                        }

                        for (var i = 3; i < 10; i++) {
                            if (i > pageCount) {
                                break;
                            } 
                            $(".div-div-showpages").append('<span class="span-page">'+i+'</span>');
                        }
                        
                    
                        if (pageCount > 10) {
                            $(".div-div-showpages").append('<span class="breaknext">...</span>');
                            // $(".div-div-showpages").append('<span class="span-page">'+(pageCount-1)+'</span>');
                            // $(".div-div-showpages").append('<span class="span-page">'+pageCount+'</span>');
                        } 

                        $(".div-div-showpages").append('<span class="span-div-limit-nextpage">后页></span>');
                    
                        $(".div-limit-pages").data("tablesql", sqlStmt);
                        $(".div-limit-pages").data("pageCount", pageCount);
                        $(".div-limit-pages .span-div-limit-count").text(dataCount);
                        
                        $(".footer .div-span-signcheck").text("success");
                    } else {
                        $(".footer .div-span-signcheck").text("fail");
                        tipsConfirm("sign check fail");
                    }


                } else if (result.status == 310) {
                    $(".table-data").empty();
                    $(".div-limit-pages").empty();
                    $(".div-limit-pages").append('<div class="div-div-countpages">共有<span class="span-div-limit-count">0</span>条记录</div>');
                    $(".div-limit-pages").append('<div class="div-div-showpages"></div>');
                    tipsConfirm("table "+ tableName +" is empty !");
                } else {
                    tipsConfirm("can't get data !");
                }

                var endtime = (new Date()).getTime();
                var responseTimeMs = endtime - starttime; 
                $(".footer .div-span-time").text(responseTimeMs);
            });
        }
    }
});


//精确查询和模糊查询选定列
$(document).on("click",".div-accurate-select .div-columns div, .div-fuzzy-select .div-columns div",function(){
    if($(this).hasClass("checked")){
        $(this).removeClass("checked");
    }else{
        $(this).addClass("checked");
    }
});

$(document).on("dblclick",".div-accurate-select .div-columns div, .div-fuzzy-select .div-columns div",function(){
    $(this).removeClass("checked");
    $columnEqual = $(this).children("span.column-equal");
    $columnName = $(this).children("span.column-name");
    $columnValue = $(this).children("span.column-value");
    $columnEqual.show();
    // $columnName.hide();
    $columnValue.show().focus();
});

$(document).on("blur",".div-accurate-select .div-columns div, .div-fuzzy-select .div-columns div",function(){
    $columnEqual = $(this).children("span.column-equal");
    $columnValue = $(this).children("span.column-value");

    if ($columnValue.text().trim() == "") {
        $columnEqual.hide();
    }
});

//复合查询选定列
$(document).on("click",".div-complex-select .div-columns div",function(){
    if($(this).hasClass("checked")){
        $(this).removeClass("checked");
    }else{
        $(this).addClass("checked");
    }
});

//范围查询选定列
$(document).on("click",".div-range-select .div-columns #div-div-columns",function(){
    if($(this).hasClass("checked")){
        $(this).removeClass("checked");
    }else{
        $(this).addClass("checked");
    }
});

$(document).on("click",".div-range-select .div-columns .div-column-choice div",function(){
    $(this).siblings().removeClass("choice-checked");
    if($(this).hasClass("choice-checked")) {
        $(this).removeClass("choice-checked");
    }else {
        $(this).addClass("choice-checked");
    }
});

//聚集查询选定列
$(document).on("click",".div-aggregate-select .div-columns #div-div-columns",function(){
    if($(this).hasClass("checked")){
        $(this).removeClass("checked");
    }else{
        $(this).addClass("checked");
    }
});

$(document).on("click",".div-aggregate-select .div-columns .div-column-choice div",function(){
    var strVal = $(this).parents().parents().data("col-name");

    $(this).siblings().removeClass("choice-checked");
    if($(this).hasClass("choice-checked")) {
        $(this).parents().prev("#div-div-columns").children(".column-name").html(strVal);
        $(this).removeClass("choice-checked");
    }else {
        var strFunc = $(this).children("span").text().trim();
        $(this).parents().prev("#div-div-columns").children(".column-name").html(strFunc+"("+strVal+")");
        $(this).addClass("choice-checked");
        console.log(strFunc+"("+strVal+")");
    }
});

//分页更新列表
$(document).on("click", ".div-data .div-div-showpages .span-page", function(){
    var queryData = {};
    var strpage = $(this).text().trim();
    var sqlstmt = $(".div-limit-pages").data("tablesql");
    var strpagecount = $(".div-limit-pages").data("pageCount");
    var page = parseInt(strpage);
    var pagecount = parseInt(strpagecount);

    queryData.startquery = (strpage-1)*20;
    queryData.sqlstmt = sqlstmt;
    
    console.log("page="+strpage);

    var starttime = (new Date()).getTime();

    $.ajax({
        method: "post",
        url: "/pageSelect",
        dataType: "json",
        data: queryData,
    }).done(function(result){
        if (result.status == 200) 
        {
            //签名认证
            var getresult = JSON.parse(result.data);
            var encrydata = result.encrydata;
            var publickey = $("head").data("public-key");
            var decrypt = new JSEncrypt();
            decrypt.setPublicKey(publickey);
            var decryptedData = decrypt.decrypt(encrydata);
            var sha256 = CryptoJS.SHA256(result.data);
            sha256 = CryptoJS.enc.Base64.stringify(sha256);
            sha256 = sha256.slice(0,-1) + "A";

            $(".table-data").empty();            
            console.log("sha="+sha256);
            console.log("dec="+decryptedData);
            
//            if (sha256.slice(0,-1) == decryptedData.slice(0,-1)) {
            if (sha256 == decryptedData) {
                var getData = getresult.result;

                $.each(getData, function(index, value){
                    if (index == 0) {
                        var colnameArr = eval("("+value+")");
                        $(".table-data").append('<tr class="colname-data"></tr>');
                        $.each(colnameArr.colname, function(index, colName) {
                            // console.log(colName);
                            $(".colname-data").append('<th>'+colName+'</th>');
                        });
                    } else {
                        var $trRowData = $('<tr class=row-data></tr>');
                        var rowdataArr = eval("("+value+")");
                        $.each(rowdataArr.rowdata, function(index, colData){
                            var $td = $('<td title="'+ colData + '">'+colData+'</td>');
                            $trRowData.append($td);
                        });
                        $(".table-data").append($trRowData);
                    }
                });

                //重置分页
                $(".div-div-showpages").empty();
                $(".div-div-showpages").append('<span class="span-div-limit-prevpage"><前页</span>');

                if (page > 6){
                    $(".div-div-showpages").append('<span class="span-page">1</span>');
                    if (page > 7) {
                        $(".div-div-showpages").append('<span class="span-page">2</span>');                    
                    }
                }   
                $(".div-div-showpages").append('<span class="breakprev">...</span>');
                //前五页
                for (var i = page - 5; i < page; i++) {
                    if (i < 1)
                        continue; 
                    $(".div-div-showpages").append('<span class="span-page">'+i+'</span>');
                }

                $(".div-div-showpages").append('<span class="this-page">'+strpage+'</span>');

                //后五页
                for (var i = page+1; i <= page+5; i++) {
                    if (i > pagecount) {
                        break;
                    }
                    $(".div-div-showpages").append('<span class="span-page">'+i+'</span>');
                }

                $(".div-div-showpages").append('<span class="breaknext">...</span>');
                // if (strpage < pagecount-6) {
                //     if (strpage < pagecount-7) {
                //         $(".div-div-showpages").append('<span class="span-page">'+(pagecount-1)+'</span>');
                //     }
        
                //     $(".div-div-showpages").append('<span class="span-page">'+strpagecount+'</span>');
                // } 

                $(".div-div-showpages").append('<span class="span-div-limit-nextpage">后页></span>');

                if (page > 7)
                    $(".div-limit-pages .breakprev").show();
                else 
                    $(".div-limit-pages .breakprev").hide();

                if (page < pagecount-7)
                    $(".div-limit-pages .breaknext").show();
                else 
                    $(".div-limit-pages .breaknext").hide();
                    
                $(".footer .div-span-signcheck").text("success");
            } else {
                $(".footer .div-span-signcheck").text("fail");
                tipsConfirm("sign check fail");
            }
        } else if (result.status == 310) {
            $(".table-data").empty();
            tipsConfirm("table "+ tableName +" is empty !");
        } else {
            tipsConfirm("can't get data !");
        }

        var endtime = (new Date()).getTime();
        var responseTimeMs = endtime - starttime; 
        $(".footer .div-span-time").text(responseTimeMs);
    });

});

$(document).on("click", ".div-data .div-div-showpages .span-div-limit-prevpage", function(){
    var $thispage = $(".div-data .div-div-showpages .this-page");
    var strpage = $thispage.text().trim();
    if (strpage != "1")
        $thispage.prev().click();
        
    console.log("prevpage="+strpage);
});

$(document).on("click", ".div-data .div-div-showpages .span-div-limit-nextpage", function(){
    var $thispage = $(".div-data .div-div-showpages .this-page");
    var strpage = $thispage.text().trim();
    var strpagecount = $(".div-limit-pages").data("pageCount");
    if (strpage != strpagecount)
        $thispage.next().click();

    console.log("nextpage="+strpage);
});

//弹窗函数
function tipsConfirm(msg, callback){
    var $confirm = $(".tipsConfirm");
    if ($confirm.length > 0) $confirm.remove();
    $confirm = $("<div class='tipsConfirm'></div>");
    var $shadow = $("<div class='shadow'></div>");
    var $content = $("<div class='content'></div>");
    var $tipname = $("<div class='tipname'>tips</div>")
    var $msg = $("<div class='msg'>"+ msg +"</div>");
    var $btn = $('<div class="btn"> ' +
        '<div class="cancel">Cancel</div> ' +
        '<div class="ok">Ok</div> </div>');

    $btn.on("click", ".cancel", function () {
        $(this).parents(".tipsConfirm").remove();
    });
    $btn.on("click", ".ok", function () {
        $(this).parents(".tipsConfirm").remove();
        if(callback) callback();
    });
    $content.append($tipname).append($msg).append($btn);
    $confirm.append($shadow)
        .append($content)
        .appendTo($("body"));
}
