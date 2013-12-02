define(['dojo/dom', 'dojo/_base/array', 'dojo/on', 'dojo/topic',
    'cbtree/Tree', 'cbtree/model/FileStoreModel', 'cbtree/store/FileStore', 'cbtree/extensions/TreeStyling', 'cbtree/store/Hierarchy',
    'cbtree/model/TreeStoreModel', 'dojo/_base/event', 'dojo/aspect', 'dojo/dom-attr', 'dijit/Tree',
    'dijit', 'dijit/Menu', 'dijit/MenuItem',
    'dojo/request/xhr', 'dojo/query',
    'ugrabio/TaxonTree',
    'dojo/domReady!'],
    function (dom, array, on, topic, cbTree, FileStoreModel, FileStore, TreeStyling, Hierarchy, TreeStoreModel, event, aspect, attr, Tree, dijit, Menu, MenuItem, xhr, query, TaxonTree) {
        var menu = new Menu();
        menu.bindDomNode(TaxonTree.domNode);

        aspect.before(menu, '_openMyself', function (e) {
            var treeNode = dijit.getEnclosingWidget(e.target).focusedChild,
                treeItem = treeNode.item,
                menuItems = menu.getChildren();
            array.forEach(menuItems, function (menuItem) {
                menu.removeChild(menuItem);
            });

            menu.addChild(new MenuItem({
                label: treeItem.name !== '.' ? treeItem.name : 'Все таксоны',
                disabled: true
            }));

            if (treeNode.isExpandable) {
                menu.addChild(new MenuItem({
                    label: 'Добавить новый таксон',
                    iconClass: 'dijitInline dijitIcon dijitIconTask'
                }));
            }

            menu.addChild(new MenuItem({
                label: 'Редактировать',
                iconClass: 'dijitIcon dijitIconEdit'
            }));

            menu.addChild(new MenuItem({
                label: 'Удалить',
                iconClass: 'dijitEditorIcon dijitEditorIconDelete'
            }));
        });

        return menu;
    });
