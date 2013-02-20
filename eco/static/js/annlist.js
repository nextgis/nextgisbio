showAnnList = function(annURL, winTitle) {
    var annJsonStore = new Ext.data.JsonStore({
        url: annURL,
        idProperty: 'id',
        root: 'data',
        fields : [
            {name: 'name',      mapping: 'name'},
            {name: 'id',        mapping: 'id'},
            {name: 'species',   mappping:'species'}
        ],
        listeners: {
            exception: function(){
                Ext.MessageBox.alert('Ошибка', "Ошибка при получении данных...");
            }
        },
        autoLoad: false
    });
    annJsonStore.load();
    annJsonStore.sort('name');
    
    var listView = new Ext.list.ListView({
        store: annJsonStore,
        multiSelect: false,
        reserveScrollOffset: true,
        columns: [{
            header: 'Название',
            dataIndex: 'name'
        }],
        autoScroll: true,
        listeners: {
            click : function (view, index,  node,  e ){
                ann = this.store.data.items[index].data;
                new formWindow({
                    form: new tableRowForm({
                        baseURL: application_root + '/annotation/', 
                        recordID: ann.id, 
                        fields: annFieldlistByTaxonId(ann.species)
                    }),
                    title: 'Аннотированный список('+ ann.id +'): ' + ann.name
                }).show();
            }
        }

    });
    new Ext.Window({
        title: winTitle, items: [listView],
        resizable: true,
        autoScroll: true,
        minWidth: 100,
        minHeight: 100,
        maxHeight: 700,
        
        listeners : {
            afterrender : {
                fn : function(win) {
                    if (win.getHeight() > win.maxHeight){
                        win.setHeight(win.maxHeight);
                    };
                    if (win.getHeight() < win.minHeight){
                        win.setHeight(win.minHeight);
                    };
                    
                    if (win.getWidth() > win.maxWidth){
                        win.setWidth(win.maxWidth);
                    };
                    if (win.getWidth() < win.minWidth){
                        win.setWidth(win.minWidth);
                    };
                }
            }
        }
    }).show();

};
