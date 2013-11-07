define(['dojo/dom', 'dojo/on', 'dojo/topic', 'cbtree/Tree', 'cbtree/model/FileStoreModel',
    'cbtree/store/FileStore', 'cbtree/extensions/TreeStyling', 'cbtree/store/Hierarchy',
    'cbtree/model/TreeStoreModel', 'dojo/_base/event', 'dojo/aspect', 'dojo/dom-attr', 'dojo/domReady!'],
    function (dom, on, topic, cbTree, FileStoreModel, FileStore, TreeStyling, Hierarchy, TreeStoreModel, event, aspect, attr) {
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

        var taxonsTree = new cbTree({
            model: model,
            icon: { iconClass: "indentIcon", indent: false },
            branchIcons: true,
            nodeIcons: true
        });

        taxonsTree.placeAt(dom.byId('leftCol'));
        taxonsTree.startup();

        var onTaxonSelectedChanged = function () {
            var id,
                ids = [],
                selectedTaxons = store.query({checked: true});
            for (var i = 0, count = selectedTaxons.length; i < count; i++) {
                id = selectedTaxons[i].path.split('/').pop();
                if (id === '.') {
                    id = 'root'
                } else {
                    id = 'taxon_' + id
                }
                ids.push(id);
            }
            topic.publish('taxon/selected/changed', ids);
        };

        taxonsTree.on("click", function (item, node, evt) {
            onTaxonSelectedChanged();

            if (item.name === '.') {
                if (item.checked) {
                    taxonsTree.collapseAll();
                } else {
                    taxonsTree._expandNode(node);
                }
            } else {
                taxonsTree._collapseNode(node);
            }

        });

        aspect.before(taxonsTree, '_expandNode', function (node) {
            if (node.get('checked')) {
                node.set('checked', false);
                onTaxonSelectedChanged();
            }
        });

        return taxonsTree;
    })
