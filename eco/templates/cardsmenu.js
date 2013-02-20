text: 'Карточки наблюдений',
menu: [
    {
        xtype: 'button',
        text: 'Млекопитающие',
        width : 150,
        handler:function(){  
            new formWindow({
                form: new tableRowForm({fields: getFields(mammaliaCardFields, null, 'mammalia'), baseURL: application_root + '/cards/'}), 
                title: 'Новая карточка'
            }).show();
        }
    },
    {
        xtype: 'button',
        text: 'Птицы',
        width : 150,
        handler:function(){  
            new formWindow({
                form: new tableRowForm({fields: getFields(avesCardFields, null, 'aves'), baseURL: application_root + '/cards/'}), 
                title: 'Новая карточка'
            }).show();
        }
    },
    {
        xtype: 'button',
        text: 'Рептилии, амфибии, рыбы',
        width : 150,
        handler:function(){  
            new formWindow({
                form: new tableRowForm({fields: getFields(araCardFields, null, 'ara'), baseURL: application_root + '/cards/'}), 
                title: 'Новая карточка'
            }).show();
        }
    },
    {
        xtype: 'button',
        text: 'Членистоногие',
        width : 150,
        handler:function(){  
            new formWindow({
                form: new tableRowForm({fields: getFields(arthropodaCardFields, null, 'arthropoda'), baseURL: application_root + '/cards/'}), 
                title: 'Новая карточка'
            }).show();
        }
    },
    {
        xtype: 'button',
        text: 'Мхи',
        width : 150,
        handler:function(){  
            new formWindow({
                form: new tableRowForm({fields: getFields(mossCardFields, null, 'moss'), baseURL: application_root + '/cards/'}), 
                title: 'Новая карточка'
            }).show();
        }
    },
    {
        xtype: 'button',
        text: 'Сосудистые растения',
        width : 150,
        handler:function(){  
            new formWindow({
                form: new tableRowForm({fields: getFields(plantaeCardFields, null, 'plantae'), baseURL: application_root + '/cards/'}), 
                title: 'Новая карточка'
            }).show();
        }
    },
    {
        xtype: 'button',
        text: 'Грибы, лишайники',
        width : 150,
        handler:function(){  
            new formWindow({
                form: new tableRowForm({fields: getFields(lichenesCardFields, null, 'lichenes'), baseURL: application_root + '/cards/'}), 
                title: 'Новая карточка'
            }).show();
        }
    },
    '-',
    {
        xtype: 'button',
        text: 'Экспорт в csv',
        width : 150,
        handler:function(){
            nodes = tree.getTaxonIdHandler();
            url = application_root + '/cards_download/csv/?taxon_list=' + nodes;
            window.open(url);
        }
    },
    {
        xtype: 'button',
        text: 'Экспорт в shp',
        width : 150,
        handler:function(){
            nodes = tree.getTaxonIdHandler();
            url = application_root + '/cards_download/shp/?taxon_list=' + nodes;
            window.open(url);
        }
    }
]
