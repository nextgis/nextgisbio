define(['dojo/ready', 'dojo/query', 'dojo/dom-class'], function(ready, query, domClass) {
    function hideLoader() {
        domClass.remove(query('body')[0], 'loading')
    }

    ready(function(){
        createMap();
        window.setTimeout(hideLoader, 1000);
    });
    return { }
})