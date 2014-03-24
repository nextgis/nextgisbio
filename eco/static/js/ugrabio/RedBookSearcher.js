define('ugrabio/RedBookSearcher', [
    'dojo/_base/declare',
    'dijit/form/ComboBox',
    'dojox/data/QueryReadStore'
], function (declare, ComboBox, QueryReadStore) {
    var RedBookSearcher = declare('RedBookSearcher', [], {
        _store: null,
        _comboBox: null,

        constructor: function () {
            this._store = new QueryReadStore({
                url: application_root + '/redbook/filter'
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
        }
    });

    return RedBookSearcher;
});