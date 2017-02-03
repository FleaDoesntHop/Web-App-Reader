if(location.href.indexOf('id=') > -1) {
    var idSource1 = location.href.split('id=');
    if(idSource1.indexOf('&') > -1) {
        var idSource2 = idSource1[1].split('&');
        id = idSource2[0];
    } else {
        id = idSource1[1];
    }
} else {
    id = 18218;
}
if(!id || id == 0) {
    id = 18218;
}
$.get('/ajax/book?id=' + id, function(d) {
    new Vue({
        el:'#app',
        data: d,
        methods:{
            readBook: function() {
                location.href = '/reader'
            }
        }
    });
},'json');
