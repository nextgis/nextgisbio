define(['dojo/ready', 'dojo/query', 'dojo/dom-class', 'dojo/dom-style'], function(ready, query, domClass, domStyle) {
    function hideLoader() {
        domClass.remove(query('body')[0], 'loading')
    }

    ready(function(){
        document.ngbioLoader.stop();
        domStyle.set(document.ngbioLoader.htmlLoaderIndicator, 'width', '100%');
        window.setTimeout(hideLoader, 1000);
    });

    return { }
});