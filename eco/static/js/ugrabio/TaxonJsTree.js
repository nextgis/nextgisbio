define('ugrabio/TaxonJsTree', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/Deferred',
    'dojo/request/xhr',
    'jstree/jstree',
    'dojo/text!./templates/SpecieTreeNodeTemplate.html',
    'mustache/mustache'
], function (declare, lang, topic, Deferred, xhr, jstree, specieTreeNodeTemplate, mustache) {
    return declare([], {
        $taxonJsTree: null,

        constructor: function (domSelector) {
            var context = this,
                $tree = this.$taxonJsTree = jQuery(domSelector);
            $tree.jstree({
                'core': {
                    'themes': {
                        'variant': 'small'
                    },
                    'data': {
                        'url': '/taxon/child',
                        'data': function (node) {
                            return {'id': node.id};
                        },
                        success: function (data) {
                            context.createHtmlNodes(data);
                            return data;
                        }
                    }
                },
                'checkbox': {
                    'keep_selected_style': false
                },
                'plugins': ['wholerow', 'checkbox']
            });

            $tree.on('changed.jstree', function (e, data) {
                topic.publish('taxon/selected/changed', $tree.jstree('get_top_selected'));
            });

            $tree.on('loaded.jstree', function (e, data) {
                $tree.jstree('open_node', 'root');
            });

            topic.subscribe('taxon/select', function () {
                context.selectTaxonNode(arguments[0]);
            });
        },

        specieNodeTemplate: specieTreeNodeTemplate,
        createHtmlNodes: function (data) {
            var taxonItem;

            for (var i = 0, countTaxons = data.length; i < countTaxons; i++) {
                taxonItem = data[i];
                if (taxonItem.is_specie && taxonItem.author) {
                    taxonItem.text = mustache.render(this.specieNodeTemplate, {
                        name: taxonItem.text,
                        author: taxonItem.author
                    });
                }
            }
        },

        selectTaxonNode: function (taxonId) {
            var tree = this.$taxonJsTree,
                getPath = xhr(application_root + '/taxon/path/' + taxonId, {
                    handleAs: 'json'
                }),
                deferred = new Deferred();

            if (tree.jstree('is_loaded', taxonId)) {

            }

            getPath.then(lang.hitch(this, function (data) {
                this._expandBranchByHierarchy(data.path, data.path.length, deferred);
            }));

            return deferred.promise;
        },

        _expandBranchByHierarchy: function (hierarchyPathArray, hierarchyDepth, deferred) {
            var tree = this.$taxonJsTree,
                currentNodeId = hierarchyPathArray[0],
                node;

            tree.jstree('load_node', currentNodeId, lang.hitch(this, function (data) {
                hierarchyPathArray.splice(0, 1);
                hierarchyDepth--;

                if (hierarchyDepth > 1) {
                    this._expandBranchByHierarchy(hierarchyPathArray, hierarchyDepth, deferred);
                } else {
                    node = tree.jstree('get_node', hierarchyPathArray[0]);
                    if (!node.state.selected) {
                        tree.jstree('select_node', node);
                    }
                    this._focusToNode(node);
                    deferred.resolve();
                }
            }));
        },

        _focusToNode: function (node) {
            // from https://github.com/vakata/jstree/issues/519
            var tree = this.$taxonJsTree;
            tree.scrollTop = jQuery(node).offset().top - jQuery(tree).offset().top / 2;
        }
    });
});