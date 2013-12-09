define([
    'dojo/_base/array',
    'dojo/on',
    'dojo/topic',
    'dojo/domReady!'
], function (array, on, topic) {

    if (!ugrabio.is_auth) {
        return false;
    }

    var openWindow = function (url) {
        window.open(url);
    };

    topic.subscribe('open/window', function (url) {
        openWindow(application_root + url);
    });

    topic.subscribe('open/link/self', function (url) {
        window.open(url, '_self');
    });

    topic.subscribe('open/window/taxon_list', function (url) {
        var tree = dijit.byId('taxonsTree'),
            itemsSelected = tree.model.store.query({checked: true}),
            taxonsId = [];

        taxonsId = []
        array.forEach(itemsSelected, function (item) {
            taxonsId.push('taxon_' + item.id);
        });

        url = application_root + url + '?nodes=' + taxonsId.join(',');
        openWindow(url);
    });
});