define('ugrabio/TaxonJsTree', [
    'dojo/_base/declare',
    'dojo/topic',
    'jstree/jstree',
    'dojo/text!./templates/SpecieTreeNodeTemplate.html',
    'mustache/mustache'
], function (declare, topic, jstree, specieTreeNodeTemplate, mustache) {
    return declare([], {
        $taxonJsTree: null,

        constructor: function (domSelector) {
            var context = this;
            this.$taxonJsTree = jQuery(domSelector);
            var c = this.$taxonJsTree.jstree({
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

            this.$taxonJsTree.on('changed.jstree', function (e, data) {
                topic.publish('taxon/selected/changed', context.$taxonJsTree.jstree('get_top_selected'));
            });
        },

        specieNodeTemplate: specieTreeNodeTemplate,
        createHtmlNodes: function (data) {
            var taxonItem;

            for(var i = 0, countTaxons = data.length; i < countTaxons; i++) {
                taxonItem = data[i];
                if (taxonItem.is_specie && taxonItem.author) {
                    taxonItem.text = mustache.render(this.specieNodeTemplate, {
                        name: taxonItem.text,
                        author: taxonItem.author
                    });
                }
            }
        }
    });
});