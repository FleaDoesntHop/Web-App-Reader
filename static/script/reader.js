
(function(){
    "use strict";
    //定义全局对象
    var Util = (function() {
        //localStorage读写操作
        var prefix = 'Web_app_reader_';
        var StorageGetter = function(key) {
            return localStorage.getItem(prefix + key);
        };
        var StorageSetter = function(key, val) {
            return localStorage.setItem(prefix + key, val);
        };
        //JSONP方法对后台加密的数据进行解码操作
        var getJSONP = function(url, callback) {
            return $.jsonp({
                url: url,
                cache: true,
                callback: "duokan_fiction_chapter",
                success: function(result) {
                    var data = $.base64.decode(result);
                    var json = decodeURIComponent(escape(data));
                    callback(json);
                }
            });
        };
        
        return {
            StorageGetter: StorageGetter,
            StorageSetter: StorageSetter,
            getJSONP: getJSONP
        };
    })();

    //缓存需要多次获取的DOM对象
    var Dom = {
        top_nav: $("#top_nav"),
        bottom_nav: $(".bottom_nav"),
        custom_font: $(".custom_font"),
        icon_font_btn: $("#icon_font_btn"),
        icon_daytime_night: $("#icon_daytime_night"),
        icon_daytime_day: $("#icon_daytime_day")
    };
    var Win = $(window);
    var Doc = $(document);
    var body = $("body");
    var fictionContainer = $("#fiction_container");

    //从localStorage中获取小说主体内容区域的字体大小，默认为14px
    var initFontSize = parseInt(Util.StorageGetter("font_size") || 14);
    //从localStorage中获取阅读器body的类名，不同类名对应不同的背景色
    var body_class_name = Util.StorageGetter("body_class_name");

    var readerModel;
    var readerUI;

    //整个项目的入口函数，页面加载成功后将立即调用
    function main() {
        EventHandler();
        fictionContainer.css("font-size", initFontSize);

        if(body_class_name != "") {
            body.addClass(body_class_name);
        }

        if(body_class_name == "bg-color-5") {
            Dom.icon_daytime_night.hide();
            Dom.icon_daytime_day.show();
        }

        readerModel = ReaderModel();
        readerUI = ReaderBaseFrame(fictionContainer);
        readerModel.init(function(data) {
            readerUI(data);
        });
    }

    //对后台传入的数据进行JSONP解码等操作，实现数据交互
    function ReaderModel() {
        var Chapter_id;
        var totalChapters;
        var init = function(UICallBack) {
            //ES5的实现方式
            /*
            getFictionInfo(function() {
                getChapterContent(Chapter_id, function(data) {
                    //todo ...
                    UICallBack && UICallBack(data);
                })
            })
            */

            //ES6 Promise方法的实现方式
            getFictionInfoPromise().then(function(d) {
                return getChapterContentPromise();
            }).then(function(data) {
                UICallBack && UICallBack(data);
            });
        };
        //获得章节信息后执行回调函数（ES5）
        // var getFictionInfo = function(callback) {
        //     $.get("/ajax/chapter", function(data) {
        //         Chapter_id = Util.StorageGetter("chapter_id") || data.chapters[1].chapter_id;
        //         totalChapters = data.chapters.length;
        //         callback && callback();
        //     }, "json");
        // };

        //获得章节信息后异步执行函数（ES6）
        var getFictionInfoPromise = function() {
            return new Promise(function(resolve, reject) {
                $.get("/ajax/chapter", function(data) {
                    if(data.result == 0) {
                        Chapter_id = Util.StorageGetter("chapter_id") || data.chapters[1].chapter_id;
                        totalChapters = data.chapters.length;
                        resolve();
                    } else {
                        reject();
                    }
                }, "json");
            });
        };

        //获得章节内容后执行回调函数（ES5）
        // var getChapterContent = function(chapter_id, callback) {
        //     $.get("/ajax/chapter_data",{
        //         id: Chapter_id
        //     }, function(data) {
        //         if(data.result == 0) {
        //             var url = data.jsonp;
        //             Util.getJSONP(url, function(data) {
        //                 callback && callback(data);
        //             });
        //         }
        //     }, "json");
        // };

        //获得章节内容后异步执行函数（ES6）
        var getChapterContentPromise = function() {
            return new Promise(function(resolve, reject) {
                $.get("/ajax/chapter_data",{
                    id: Chapter_id
                }, function(data) {
                    if(data.result == 0) {
                        var url = data.jsonp;
                        Util.getJSONP(url, function(data) {
                            resolve(data);
                        });
                    } else {
                        reject({msg: "fail"});
                    }
                }, "json");
            });
        };

        //点击“上一页”按钮加载上一章节内容
        var prevChapter = function(UICallBack) {
            Chapter_id = parseInt(Chapter_id, 10);
            if(Chapter_id === 0) {
                return;
            }
            Chapter_id -= 1;
            //ES5
            // getChapterContent(Chapter_id, UICallBack);
            //ES6
            getChapterContentPromise(Chapter_id).then(function(data) {
                UICallBack(data);
            });
            Util.StorageSetter("chapter_id", Chapter_id);
        };
        //点击下一页按钮加载下一章节内容
        var nextChapter = function(UICallBack) {
            Chapter_id = parseInt(Chapter_id, 10);
            if(Chapter_id === totalChapters) {
                return;
            }
            Chapter_id += 1;
            //ES5
            // getChapterContent(Chapter_id, UICallBack);
            //ES6
            getChapterContentPromise(Chapter_id).then(function(data) {
                UICallBack(data);
            });
            Util.StorageSetter("chapter_id", Chapter_id);
        };

        return {
            init: init,
            prevChapter: prevChapter,
            nextChapter: nextChapter
        }
    }

    //渲染基本的UI结构
    function ReaderBaseFrame(container) {
        //当ReaderModel函数执行完毕后数据将抛给ReaderBaseFrame函数，之后由下面这个函数渲染到前端页面中
        function parseChapterData(jsonData) {
            var jsonObj = JSON.parse(jsonData);
            var html = "<h4>" + jsonObj.t + "</h4>";
            for(var i = 0, leng = jsonObj.p.length; i < leng; i++) {
                html += "<p>" + jsonObj.p[i] + "</p>";
            }
            return html;
        }

        return function(data) {
            container.html(parseChapterData(data));
        }
    }

    // 交互事件绑定
    function EventHandler() {
        //点击页面中央可唤起上下隐藏的交互界面
        $("#article_action_mid").click(function() {
            if(Dom.top_nav.css("display") == "none") {
                Dom.top_nav.show();
                Dom.bottom_nav.show();
            } else {
                Dom.top_nav.hide();
                Dom.bottom_nav.hide();
                Dom.custom_font.hide();
                Dom.icon_font_btn.removeClass("icon-font-active");
            }
        });

        //上下滑动时将自动隐藏被唤出的交互界面
        Win.scroll(function() {
            Dom.top_nav.hide();
            Dom.bottom_nav.hide();
            Dom.custom_font.hide();
            Dom.icon_font_btn.removeClass("icon-font-active");
        });

        //点击字体按钮时将唤出第二层的交互界面
        Dom.icon_font_btn.click(function() {
            if(Dom.custom_font.css("display") == "none") {
                Dom.custom_font.show();
                Dom.icon_font_btn.addClass("icon-font-active");
            } else {
                Dom.custom_font.hide();
                Dom.icon_font_btn.removeClass("icon-font-active");
            }
        });

        //内容区域字体大小调整
        $("#lg_font_btn").click(function() {
            if(initFontSize > 19) {
                return;
            }
            initFontSize += 1;
            fictionContainer.css("font-size", initFontSize);
            Util.StorageSetter("font_size", initFontSize);
        });
        $("#sm_font_btn").click(function() {
            if(initFontSize < 12) {
                return;
            }
            initFontSize -= 1;
            fictionContainer.css("font-size", initFontSize);
            Util.StorageSetter("font_size", initFontSize);
        });

        //点击颜色按钮可修改背景色
        $(".bg-color-container").click(function() {
            var eleIndex = $(this).index();
            var className = "bg-color-" + eleIndex;
            body.removeClass();
            body.addClass(className);
            Util.StorageSetter("body_class_name", className);
        })

        //白天、黑夜切换
        $("#daytime_switch_btn").click(function() {
            body.removeClass();
            if(Dom.icon_daytime_day.css("display") == "none") {
                Dom.icon_daytime_night.hide();
                Dom.icon_daytime_day.show();
                body.addClass("bg-color-5");
                Util.StorageSetter("body_class_name", "bg-color-5");
            } else {
                Dom.icon_daytime_night.show();
                Dom.icon_daytime_day.hide();
                body.addClass("bg-color-2");
                Util.StorageSetter("body_class_name", "bg-color-2");
            }
        });

        //点击“上一页/下一页“按钮时可加载新章节数据
        $("#prev_button").click(function() {
            readerModel.prevChapter(function(data) {
                readerUI(data);
                Win.scrollTop(0);
            })
        });
        $("#next_button").click(function() {
            readerModel.nextChapter(function(data) {
                readerUI(data);
                Win.scrollTop(0);
            })
        });
    }

    main();
})();