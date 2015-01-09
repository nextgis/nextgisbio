define('ugrabio/TaxonSearcher', [
    'dojo/_base/declare',
    'dojo/topic',
    'dijit/form/ComboBox',
    'dojox/data/QueryReadStore'
], function (declare, topic, ComboBox, QueryReadStore) {
    return declare('TaxonSearcher', [], {
        _store: null,
        _comboBox: null,

        constructor: function () {
            this._store = new QueryReadStore({
                url: application_root + '/taxon/filter'
            });

            this._comboBox = new ComboBox({
                id: "search",
                name: "state",
                value: "",
                store: this._store,
                searchAttr: "name",
                pageSize: 10,
                queryExpr: '${0}',
                style: "width: 50%;",
                autoComplete: false
            }, "search");

            this._comboBox.watch('item', function (what, oldVal, newVal) {
                topic.publish('taxon/select', newVal.i.id);
            });
        }
    });
});