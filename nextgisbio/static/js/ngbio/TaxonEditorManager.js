define('ngbio/TaxonEditorManager', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/window',
    'dojo/dom',
    'dojo/dom-construct',
    'dojo/request/xhr',
    'dojo/topic',
    'dojo/hash',
    'dojo/io-query',
    'dojox/widget/Standby',
    'ngbio/TaxonViewer'
], function (declare, lang, win, dom, domConstruct, xhr, topic, hash, ioQuery, Standby, TaxonViewer) {
    return declare('TaxonEditorManager', [], {
        _taxonViewer: null,

        constructor: function (tree, taxonViewerId) {
            this._tree = tree;
            this._taxonViewerId = taxonViewerId ? taxonViewerId : 'TaxonViewer';
            this._bindEvents();
        },

        _bindEvents: function () {
            topic.subscribe('taxon/selected', lang.hitch(this, function (taxonItem, node) {
                this._buildTaxonViewer(taxonItem);
            }));
        },

        _buildTaxonViewer: function (taxon) {
            domConstruct.empty(this._taxonViewerId);
            if (this._taxonViewer) {
                this._taxonViewer.destroy();
            }
            this._taxonViewer = new TaxonViewer(taxon);
            this._taxonViewer.placeAt(dom.byId(this._taxonViewerId));
        }
    });
});