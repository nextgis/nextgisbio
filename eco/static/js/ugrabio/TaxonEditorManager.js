define('ugrabio/TaxonEditorManager', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/window',
    'dojo/dom',
    'dojo/dom-construct',
    'dojo/request/xhr',
    'dojo/topic',
    'dojox/widget/Standby',
    'ugrabio/TaxonViewer'
], function (declare, lang, win, dom, domConstruct, xhr, topic, Standby, TaxonViewer) {
    return declare('TaxonEditorManager', [], {
        _taxonViewer: null,

        constructor: function(tree, taxonViewerId) {
            this._tree = tree;
            this._taxonViewerId = taxonViewerId ? taxonViewerId : 'TaxonViewer';
//            this._standBy = new Standby({target: win.body()});
            this._bindEvents();
        },

        _bindEvents: function () {
            topic.subscribe('taxon/selected', lang.hitch(this, function (taxonItem, node) {
//                this._standBy.show();
                this._buildTaxonViewer(taxonItem);
            }));
        },

        _buildTaxonViewer: function (taxon) {

//            xhr.get(application_root + )
            if (this._taxonViewer) {
                this._taxonViewer.destroy();
                domConstruct.empty(this._taxonViewerId);
            }
            this._taxonViewer = new TaxonViewer(taxon);
            this._taxonViewer.placeAt(dom.byId(this._taxonViewerId));
//
        }
    });
});