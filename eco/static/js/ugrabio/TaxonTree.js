define('ugrabio/TaxonTree', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/aspect',
    'dojo/dom',
    'dojo/request/xhr',
    'dojo/topic',
    'dojo/store/JsonRest',
    'dijit/Tree',
    'dijit/tree/ObjectStoreModel',
    'dojo/store/Observable',
    'dojo/domReady!'
], function (declare, lang, aspect, dom, xhr, topic, JsonRest, Tree, ObjectStoreModel, Observable) {

    var TaxonTree = declare('TaxonTree', [], {
        _store: null,
        _model: null,
        _tree: null,

        constructor: function () {
            var store = new JsonRest({
                target: application_root + '/tree/taxons/',
                getChildren: function (object) {
                    return this.get(object.id).then(function (fullObject) {
                        return fullObject.children;
                    });
                }
            });
            this._store = new Observable(store);

            this._model = new ObjectStoreModel({
                store: this._store,
                getRoot: function (onItem) {
                    this.store.get('root').then(onItem);
                },
                mayHaveChildren: function (object) {
                    return 'children' in object;
                }
            });

            dijit._TreeNode.prototype._setLabelAttr = {node: "labelNode", type: "innerHTML"};

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

            this._tree = new Tree({
                model: this._model,
                persist: false,
                onClick: function (item, node) {
                    topic.publish('taxon/selected', item, node);
                },
                getLabel: getTaxonLabel
            });

            this._tree.placeAt(dom.byId('leftCol'));

            var loadHandler = this._tree.on('load', lang.hitch(this, function () {
                var query_string = {};
                var query = window.location.search.substring(1);
                var vars = query.split("&");
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split("=");
                    // If first entry with this name
                    if (typeof query_string[pair[0]] === "undefined") {
                        query_string[pair[0]] = pair[1];
                        // If second entry with this name
                    } else if (typeof query_string[pair[0]] === "string") {
                        var arr = [ query_string[pair[0]], pair[1] ];
                        query_string[pair[0]] = arr;
                        // If third or later entry with this name
                    } else {
                        query_string[pair[0]].push(pair[1]);
                    }
                }
                var taxon_id = query_string.taxon_id;
                if (taxon_id && !isNaN(parseFloat(taxon_id)) && isFinite(taxon_id)) {
                    this.selectTaxon(taxon_id);
                }
                loadHandler.remove();
            }));

            this._tree.startup();
        },

        selectTaxon: function (taxonId) {
            var tree = this,
                getPath = xhr(application_root + '/taxon/parent_path/' + taxonId, {
                    handleAs: 'json'
                });
            getPath.then(function (data) {
                tree._expandBranchByHierarchy(data.path, data.path.length, 1);
            });
        },

        _expandBranchByHierarchy: function (hierarchy, hierarchyDepth, levelIndex) {
            var tree = this._tree,
                pathToNode,
                node;

            node = tree._itemNodesMap[hierarchy.slice(levelIndex - 1, levelIndex)][0];

            if (levelIndex != hierarchyDepth) {
                tree._expandNode(node).then(lang.hitch(this, function () {
                    this._expandBranchByHierarchy(hierarchy, hierarchyDepth, levelIndex + 1);
                }));
            } else {
                tree.focusNode(node);
                topic.publish('taxon/selected', node.item, node);
            }
        }
    });

    return TaxonTree;
});