$.get('/ajax/index', function(d){
    //页面加载时获取手机的屏幕宽度
    var windowWidth = $(window).width();
    if(windowWidth < 320) {
        windowWidth = 320;
    }

    //获取顶部“书城/书架"导航栏中“书城”标签的偏移量，返回的对象值包括{left, top, width, height}，之后通过offset.width将其动态生成的宽度值赋予滑动门
    var offset = $($('.swipe-tab').find('a')[0]).offset();
    var index_header_tab_width = offset.width;

    new Vue({
        el: '#app',
        data: {
            //屏幕宽度
            screen_width: windowWidth,
            //双倍屏宽
            double_screen_width: windowWidth * 2,
            //滑动门宽度
            index_header_tab_width: index_header_tab_width,
            //顶部导航栏数据
            top: d.items[0].data.data,
            //热门书籍数据
            hot: d.items[1].data.data,
            //重磅推荐数据
            recommend: d.items[2].data.data,
            //女生频道数据
            female: d.items[3].data.data,
            //男生频道数据
            male: d.items[4].data.data,
            //免费阅读数据
            free: d.items[5].data.data,
            //首页底部话题栏数据
            topic: d.items[6].data.data,
            //滑动门滑动动画时长及位移量
            duration:0,
            position:0,
            header_position: 0,
            header_duration:0,
            //滑动门滑动时变化字体样式
            tab_1_class: 'swipe-tab__on',
            tab_2_class:''
        },
        methods: {
            //点击“书城/书架”时滑动门移动
            swipeTab: function(pos) {
                this.duration = 0.5;
                this.header_duration = 0.5;
                if(pos === 0) {
                    this.position = 0;
                    this.header_position = 0;
                    this.tab_1_class = 'swipe-tab__on';
                    this.tab_2_class = '';
                } else {
                    this.position = -windowWidth;
                    this.header_position = index_header_tab_width;
                    this.tab_1_class = '';
                    this.tab_2_class = 'swipe-tab__on';
                }
            }
        }
    });
}, 'json');
