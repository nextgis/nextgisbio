define([
    'dojo/_base/array',
    'dojo/on',
    'dojo/topic',
    'dijit/MenuBar',
    'dijit/PopupMenuBarItem',
    'dijit/Menu',
    'dijit/MenuItem',
    'dijit/DropDownMenu',
    'ugrabio/Forms',
    'ugrabio/Dialog',
    'dojo/domReady!'
], function (array, on, topic, MenuBar, PopupMenuBarItem, Menu, MenuItem, DropDownMenu, Forms, Dialog) {
    var openWindow;
    openWindow = function (url) {
        window.open(url);
    };

    topic.subscribe('open/window', function (url) {
        openWindow(application_root + url);
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