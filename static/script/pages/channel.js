var sex = location.href.split('/').pop();
$.get('/ajax/channel/' + sex, function(d){
    console.log(d);
    new Vue({
        el: '#app',
        data: d
    });
}, 'json');