define(['dojo/dom', 'dojo/on', 'dojo/topic', 'dojo/store/JsonRest', 'dojo/_base/array', 'dojo/Deferred', 'dojo/promise/all',
        'cbtree/Tree', 'cbtree/model/FileStoreModel',
        'cbtree/store/FileStore', 'cbtree/store/Eventable', 'dojo/store/Observable', 'cbtree/extensions/TreeStyling', 'cbtree/store/Hierarchy',
        'cbtree/model/TreeStoreModel', 'dojo/_base/event', 'dojo/aspect', 'dojo/dom-attr', 'dijit/Tree',
        'dojo/request/xhr', 'dojo/query', 'dijit/registry',
        'ngbio/Filter', 'ngbio/QueryString', 'dojo/domReady!'],
    function (dom, on, topic, JsonRest, array, Deferred, all,
              cbTree, FileStoreModel, FileStore, Eventable, Observable, TreeStyling, Hierarchy,
              TreeStoreModel, event, aspect, attr, Tree, xhr, query, registry, Filter, QueryString) {

        // for supporting html label of node
        Tree._TreeNode.prototype._setLabelAttr = {node: "labelNode", type: "innerHTML"};

        var store = new FileStore({
            url: application_root + "/cbtree/taxons",
            basePath: '.',
            autoLoad: true
        });

        var model = new FileStoreModel({
            store: store,
            checkedRoot: true,
            checkedStrict: false,
            sort: [
                {attribute: 'name', descending: true}
            ],
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
            id: 'taxonsTree',
            getLabel: getTaxonLabel,
            publishChangedEvent: false
        });

        //taxonsTree.placeAt(dom.byId('leftCol'));
        //
        //taxonsTree.startup();

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

            if (taxonsTree.publishChangedEvent) {
                topic.publish('taxon/selected/changed', ids);
            }
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

        taxonsTree._expandBranchByHierarchy = function (hierarchy, hierarchyDepth, levelIndex, deferred) {
            var tree = this,
                pathToNode,
                node;

            pathToNode = './' + hierarchy.slice(0, levelIndex).join('/');
            node = tree._itemNodesMap[pathToNode][0];

            if (levelIndex != hierarchyDepth) {
                tree._expandNode(node).then(function () {
                    tree._expandBranchByHierarchy(hierarchy, hierarchyDepth, levelIndex + 1, deferred);
                });
            } else {
                tree.focusNode(node);
                node.set('checked', true);
                nodesChecked[node.item.id] = node;
                if (deferred) deferred.resolve();
                onTaxonSelectedChanged();
            }
        };

        taxonsTree.selectTaxon = function (taxonId, isDefered) {
            var tree = this,
                getPath = xhr(application_root + '/taxon/parent_path/' + taxonId, {
                    handleAs: 'json'
                }),
                deferred = isDefered ? new Deferred() : false;

            getPath.then(function (data) {
                tree._expandBranchByHierarchy(data.path, data.path.length, 1, deferred);
            });

            return deferred.promise;
        };

        on(query('#leftCol a.clear'), 'click', function () {
            for (var nodeId in nodesChecked) {
                if (nodesChecked.hasOwnProperty(nodeId)) {
                    nodesChecked[nodeId].set('checked', false);
                    delete nodesChecked[nodeId];
                }
            }
            taxonsTree.collapseAll();
            onTaxonSelectedChanged();
        });

        on(query('#leftCol a.filter'), 'click', function () {
            var filterDialog = registry.byId('filterDialog'),
                selectedTaxonsId = [];

            for (var nodeId in nodesChecked) {
                if (nodesChecked.hasOwnProperty(nodeId)) {
                    selectedTaxonsId.push(parseInt(nodeId, 10));
                }
            }

            attr.set(query('input[name=taxons]', filterDialog.domNode)[0], 'value',
                selectedTaxonsId.join(','));

            filterDialog.show();
        });

        taxonsTree.on('load', function () {
            var parameters = (new QueryString).getParameters(),
                deferreds = [];
            if (parameters['taxons']) {
                var taxons_selected = decodeURIComponent(parameters['taxons']).split(',');
                for (var count = taxons_selected.length, i = 0; i < count; i++) {
                    deferreds.push(taxonsTree.selectTaxon(taxons_selected[i], true));
                }

                all(deferreds).then(function (results) {
                    taxonsTree.publishChangedEvent = true;
                    onTaxonSelectedChanged();
                });
            } else {
                taxonsTree.publishChangedEvent = true;
            }
        });

        return taxonsTree;
    });
