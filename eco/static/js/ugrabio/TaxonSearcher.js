define([
    'dojo/ready',
    'dijit/form/ComboBox',
    'dojox/data/QueryReadStore',
    'dojo/on',
    'dojo/request/xhr',
    'ugrabio/TaxonTree'
], function (ready, ComboBox, QueryReadStore, on, xhr, TaxonTree) {
    ready(function () {
        var taxonStore = new QueryReadStore({
            url: application_root + '/taxon/filter'
        });

        var comboBox = new ComboBox({
            id: "search",
            name: "state",
            value: "",
            store: taxonStore,
            searchAttr: "name",
            pageSize: 10,
            queryExpr: '${0}',
            style: "width: 50%;",
            autoComplete: false
        }, "search");

        comboBox.watch('item', function (what, oldVal, newVal) {
            TaxonTree.selectTaxon(newVal.i.id);
        });

        return comboBox;
    })
})