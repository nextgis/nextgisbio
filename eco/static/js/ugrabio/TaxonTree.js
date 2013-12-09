define('ugrabio/TaxonTree', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/request/xhr',
    'dojo/topic',
    'dojo/store/JsonRest',
    'dijit/Tree',
    'dijit/tree/ObjectStoreModel',
    'dojo/domReady!'
], function (declare, lang, dom, xhr, topic, JsonRest, Tree, ObjectStoreModel) {

    var TaxonTree = declare('TaxonTree', [], {
        _store: null,
        _model: null,
        _tree: null,

        constructor: function () {
            this._store = new JsonRest({
                target: application_root + '/tree/taxons/',
                getChildren: function (object) {
                    return this.get(object.id).then(function (fullObject) {
                        return fullObject.children;
                    });
                }
            });

            this._model = new ObjectStoreModel({
                store: this._store,
                getRoot: function (onItem) {
                    this.store.get('root').then(onItem);
                },
                mayHaveChildren: function (object) {
                    return 'children' in object;
                }
            });

            this._tree = new Tree({
                model: this._model,
                persist: false,
                onClick: function (item, node) {
                    topic.publish('taxon/selected', item, node);
                }
            });

            this._tree.placeAt(dom.byId('leftCol'));
            this._tree.startup();
        },

        selectTaxon: function (taxonId) {
            var tree = this,
                getPath = xhr(application_root + '/taxon/' + taxonId + '/parent_path', {
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
                node.domNode.onclick();
            }
        }
    });

    return TaxonTree;
});