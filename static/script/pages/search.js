new Vue({
    el: '#app_search',
    data: {
        search: [],
        //通过v-show绑定下面判断条件，实现搜索结果不为空、及搜索结果为空两种情况时分别在页面上展示不同的样式
        condition: true,
        empty: false
    },
    methods: {
        doSearch: function(e) {
            var keyword = $('#search_box').val();
            var self = this;
            $.get('/ajax/search', {
                //将搜索框输入的关键词传递给服务端
                keyword: keyword
            }, function(d){
                self.condition = false;
                self.search = d.items;
                if(self.search.length == 0) {
                    self.empty = true;
                } else {
                    self.empty = false;
                }
            }, 'json')
        }
    }
});