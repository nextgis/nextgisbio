define([
    'dojo/_base/array',
    'dojo/on',
    'dojo/topic',
    'dijit/MenuBar',
    'dijit/PopupMenuBarItem',
    'dijit/Menu',
    'dijit/MenuItem',
    'dijit/MenuSeparator',
    'dijit/DropDownMenu',
    'ugrabio/Forms',
    'ugrabio/Dialog',
    'dojo/domReady!'
], function (array, on, topic, MenuBar, PopupMenuBarItem, Menu, MenuItem, MenuSeparator, DropDownMenu, Forms, Dialog) {

    var menuList = Forms.menuList,
        menuBar = new MenuBar({});

    for (var menuId in menuList) {
        if (menuList.hasOwnProperty(menuId)) {
            var subMenu = new DropDownMenu({});

            array.forEach(menuList[menuId], function (menuItemTemplate) {
                if (typeof menuItemTemplate === 'string') {
                    subMenu.addChild(new MenuSeparator());
                } else {
                    var menuItem = new MenuItem({
                    'label': menuItemTemplate.label
                });

                on(menuItem, 'click',  function () {
                    topic.publish(menuItemTemplate.action, menuItemTemplate.params);
                });

                subMenu.addChild(menuItem);
                }
            });
            menuBar.addChild(new PopupMenuBarItem({
                label: menuId,
                popup: subMenu
            }));
        }
    }

    menuBar.placeAt('menu');
    menuBar.startup();
});