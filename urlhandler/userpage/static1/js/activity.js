var debugView = false

window.addEventListener('load', function(){
    if (!debugView) {
        model.fetch();
    }
    var tab = new Navigation('.ui-tab-nav', '.ui-tab-content');
})    

