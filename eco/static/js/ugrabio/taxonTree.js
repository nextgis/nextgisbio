define(['dojo/dom', 'dojo/on', 'dojo/topic', 'cbtree/Tree', 'cbtree/model/FileStoreModel',
    'cbtree/store/FileStore', 'cbtree/extensions/TreeStyling', 'cbtree/store/Hierarchy',
    'cbtree/model/TreeStoreModel', 'dojo/_base/event', 'dojo/aspect', 'dojo/dom-attr', 'dijit/Tree',
    'dojo/request/xhr', 'dojo/query', 'dojo/domReady!'],
    function (dom, on, topic, cbTree, FileStoreModel, FileStore, TreeStyling, Hierarchy, TreeStoreModel,
              event, aspect, attr, Tree, xhr, query) {
        Tree._TreeNode.prototype._setLabelAttr = {node: "labelNode", type: "innerHTML"};
        var store = new FileStore({
            url: "tree/taxons",
            basePath: '.',
            autoLoad: true
        });

        var model = new FileStoreModel({
            store: store,
            checkedRoot: true,
            checkedStrict: false,
            iconAttr: "icon"
        });

        var getTaxonLabel = function (item) {
            if (item.path === '.') {
                return 'Все таксоны';
            }
            var author = item.author ? ' ' + item.author : '';
            if (item.is_specie) {
                return '<b>' + item.name + '</b>' + author;
            } else {
                return item.name + author
            }
        };

        var taxonsTree = new cbTree({
            model: model,
            icon: { iconClass: "indentIcon", indent: false },
            branchIcons: true,
            nodeIcons: true,
            getLabel: getTaxonLabel
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

        var nodesChecked = {};
        taxonsTree.on("checkBoxClick", function (item, node, evt) {
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

            if (item.checked) {
                nodesChecked[item.id] = node;
            } else {
                delete nodesChecked[item.id];
            }
        });

        aspect.before(taxonsTree, '_expandNode', function (node) {
            if (node.get('checked')) {
                node.set('checked', false);
                onTaxonSelectedChanged();
            }
        });

        taxonsTree._expandBranchByHeirarchy = function (hierarchy, hierarchyDepth, levelIndex) {
            var tree = this,
                pathToNode,
                node;

            pathToNode = './' + hierarchy.slice(0, levelIndex).join('/');
            node = tree._itemNodesMap[pathToNode][0];

            if (levelIndex != hierarchyDepth) {
                tree._expandNode(node).then(function () {
                    tree._expandBranchByHeirarchy(hierarchy, hierarchyDepth, levelIndex + 1);
                });
            } else {
                tree.focusNode(node);
                node.set('checked', true);
                onTaxonSelectedChanged();
            }
        };

        taxonsTree.selectTaxon = function (taxonId) {
            var tree = this,
                getPath = xhr('taxon/' + taxonId + '/parent_path', {
                    handleAs: 'json'
                });
            getPath.then(function (data) {
                tree._expandBranchByHeirarchy(data.path, data.path.length, 1);
            });
        };

        on(query('#leftCol div.clearTree a'), 'click', function() {
            for (var nodeId in nodesChecked) {
                if (nodesChecked.hasOwnProperty(nodeId)) {
                    nodesChecked[nodeId].set('checked', false);
                    delete nodesChecked[nodeId];
                }
            }
            onTaxonSelectedChanged();
        });

        return taxonsTree;
    })
