$.get('/ajax/rank', function(d){
    // console.log(d); 查看数据时发现返回的数据中“description"是包含回车符的字符串，需要将字符串转化成数组，方便前端页面获取
    for(var i=0;i< d.items.length;i++){
        d.items[i].description = d.items[i].description.split('\n');
    }
    new Vue({
        el: '#app',
        data: d
    });
}, 'json');
