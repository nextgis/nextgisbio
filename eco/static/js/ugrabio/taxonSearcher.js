define(['dojo/ready', 'dijit/form/ComboBox'], function(ready, ComboBox) {
    ready(function(){
        var comboBox = new ComboBox({
            id: "search",
            name: "state",
            value: "",
            store: taxonStore,
            searchAttr: "name",
            pageSize:10,
            queryExpr:'${0}',
            style: "width: 50%;"
        }, "search");

        comboBox.on('change', function(newValue) {
            alert(newValue);
        });
    });

    return { }
})