text: 'Контурный ареал',
menu: [
    {
        xtype: 'button',
        text: 'Экспорт в shp',
        width : 150,
        handler:function(){
            nodes = tree.getTaxonIdHandler();
            url = application_root + '/areal/download/?nodes=' + nodes;
            window.open(url);
        }
    }
]
