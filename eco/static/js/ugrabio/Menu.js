define('ugrabio/Menu', [
    'dojo/_base/array',
    'dojo/on',
    'dojo/topic',
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/MenuBar',
    'dijit/PopupMenuBarItem',
    'dijit/Menu',
    'dijit/MenuItem',
    'dijit/MenuSeparator',
    'dijit/DropDownMenu',
    'ugrabio/Forms',
    'ugrabio/Dialog',
    'dojo/domReady!'
], function (array, on, topic, declare, _WidgetBase, MenuBar, PopupMenuBarItem, Menu, MenuItem, MenuSeparator, DropDownMenu, Forms, Dialog) {

    var Menu = declare('Menu', [], {
        _menuBar: null,

        constructor: function (menuDescription, domNode) {
            this._menuBar = new MenuBar({});
            if (!this._validate(menuDescription)) return false;
            this._buildMenu(menuDescription);
            this._buildRendering(domNode);
        },

        _validate: function (menuDescription) {
            if (menuDescription.hasOwnProperty('validate') && typeof menuDescription['validate'] == 'function') {
                return menuDescription['validate']();
            } else {
                return true;
            }
        },

        _buildMenu: function (menuDescription) {
            for (var menuId in menuDescription) {
                if (menuDescription.hasOwnProperty(menuId) && menuId !== 'validate') {
                    var descriptionItem = menuDescription[menuId];
                    if (descriptionItem.validate) {
                        if (!descriptionItem.validate()) continue;
                    }

                    var subMenu = new DropDownMenu({});
                    array.forEach(menuDescription[menuId].items, function (menuItemTemplate) {
                        if (typeof menuItemTemplate === 'string') {
                            subMenu.addChild(new MenuSeparator());
                        } else {
                            var menuItem = new MenuItem({
                                'label': menuItemTemplate.label
                            });

                            on(menuItem, 'click', function () {
                                // todo: change to topic, check work topic with array of parameters
                                dojo.publish(menuItemTemplate.action, menuItemTemplate.params);
                            });

                            subMenu.addChild(menuItem);
                        }
                    });

                    this._menuBar.addChild(new PopupMenuBarItem({
                        label: menuId,
                        popup: subMenu
                    }));
                }
            }
        },

        _buildRendering: function (domNode) {
            if (!this._menuBar) return false;
            this._menuBar.placeAt(domNode);
            this._menuBar.startup();
        }
    });

    return Menu;
});