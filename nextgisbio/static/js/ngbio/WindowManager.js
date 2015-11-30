define([
    'dojo/_base/array',
    'dojo/on',
    'dojo/topic',
    'dojo/domReady!'
], function (array, on, topic) {

    if (!ngbio.is_auth) {
        return false;
    }

    var openWindow = function (url) {
        window.open(url);
    };

    topic.subscribe('open/window', function (url) {
        openWindow(application_root + url);
    });

    topic.subscribe('open/link/self', function (url) {
        window.open(application_root + url, '_self');
    });

    topic.subscribe('open/window/taxon_list', function (url) {
        var itemsSelectedId = jQuery('#taxonJsTree').jstree('get_selected'),
            taxonsId = [];

        taxonsId = [];
        array.forEach(itemsSelectedId, function (id) {
            taxonsId.push('taxon_' + id);
        });

        url = application_root + url + '?taxon_list=' + taxonsId.join(',');
        openWindow(url);
    });
});