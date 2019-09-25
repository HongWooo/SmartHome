
$(document).ready(function () {


    $("#exit").click(function () {
        alert("退出!")
    });


    $("#render").click(function () {
        alert("渲染");
    });

    // $("#view-vr").click(function () {
    //     alert("VR");
    // });
    //左边工具栏切换
    $(".tool-bar-left ul").on("click","li",function () {
        $(".tool-bar-right").css("display","block");
        $(this).addClass("active");
        $(this).siblings().removeClass("active");
        var $rightBlockName = $(".tool-bar-right-header-"+$(this).index());
        $rightBlockName.css("display","block");
        $rightBlockName.siblings().css("display","none");
    });

    //右侧隐藏按钮
    $(".hiden-right").click(function () {
        $(".tool-bar-right").css("display","none");
    });

    //家具 过滤
    $("#furn-type .select").change(function () {
        var val = $(this).val();
        if(val != "all"){
            $(".tool-bar-right-header-1 .tool-bar-right-content .panel").css("display","none");
            $(".tool-bar-right-header-1 .tool-bar-right-content ."+val).css("display","block");
        }else {
            $(".tool-bar-right-header-1 .tool-bar-right-content .panel").css("display","block");
        }
    });

    //点击左侧图片
    // $(".tool-bar-right-header-0 li").click(function () {
    //     console.log($(this).children('p').text());
    //     console.log($(this).val());
    // });


    // 点击左侧图片
    // $(".tool-bar-right-header-1 li").click(function () {
    //     console.log($(this).children('p').text());
    //     console.log($(this).val());
    // })

    // $(".tool-bar-right-header-1 .list-item ul").on("click","li",function () {
    //     console.log($(this));
    // })
    //点击左侧图片


});



