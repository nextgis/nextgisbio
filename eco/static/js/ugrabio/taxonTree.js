define(['dojo/dom', 'dojo/on', 'dojo/topic', 'cbtree/Tree', 'cbtree/model/FileStoreModel',
    'cbtree/store/FileStore', 'cbtree/extensions/TreeStyling', 'cbtree/store/Hierarchy',
    'cbtree/model/TreeStoreModel', 'dojo/domReady!'],
    function (dom, on, topic, cbTree, FileStoreModel, FileStore, TreeStyling, Hierarchy, TreeStoreModel) {
        var taxonsTree;
        var store = new FileStore({
            url: "tree/taxons",
            basePath: '.',
            autoLoad: true
        });

        var model = new FileStoreModel({
            store: store,
            rootLabel: 'Таксоны',
            checkedRoot: true,
            checkedStrict: "inherit",
            iconAttr: "icon"
        });

        taxonsTree = new cbTree({
            model: model,
            icon: { iconClass: "indentIcon", indent: false },
            branchIcons: true,
            nodeIcons: true
        });

        taxonsTree.placeAt(dom.byId('leftCol'));
        taxonsTree.startup();
        return taxonsTree;
    })
