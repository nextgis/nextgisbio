text: 'Аннотированные списки',
menu : [
    {
        xtype: 'button',
        text: 'Млекопитающие',
        width : 150,
        handler:function(){  
            new formWindow({
                form: new tableRowForm({fields: getFields(mammaliaAnnListFields, null, 'mammalia'), baseURL: application_root + '/annotation/'}), 
                title: 'Новый список'
            }).show();
        }
    },
    {
        xtype: 'button',
        text: 'Птицы',
        width : 150,
        handler:function(){  
            new formWindow({
                form: new tableRowForm({fields: getFields(avesAnnListFields, null, 'aves'), baseURL: application_root + '/annotation/'}), 
                title: 'Новый список'
            }).show();
        }
    },
    {
        xtype: 'button',
        text: 'Рептилии, амфибии, рыбы',
        width : 150,
        handler:function(){  
            new formWindow({
                form: new tableRowForm({fields: getFields(araAnnListFields, null, 'ara'), baseURL: application_root + '/annotation/'}), 
                title: 'Новый список'
            }).show();
        }
    },
    {
        xtype: 'button',
        text: 'Членистоногие',
        width : 150,
        handler:function(){  
            new formWindow({
                form: new tableRowForm({fields: getFields(arthropodaAnnListFields, null, 'arthropoda'), baseURL: application_root + '/annotation/'}), 
                title: 'Новый список'
            }).show();
        }
    },
    {
        xtype: 'button',
        text: 'Мхи',
        width : 150,
        handler:function(){  
            new formWindow({
                form: new tableRowForm({fields: getFields(mossAnnListFields, null, 'moss'), baseURL: application_root + '/annotation/'}), 
                title: 'Новый список'
            }).show();
        }
    },
    {
        xtype: 'button',
        text: 'Сосудистые растения',
        width : 150,
        handler:function(){  
            new formWindow({
                form: new tableRowForm({fields: getFields(plantaeAnnListFields, null, 'plantae'), baseURL: application_root + '/annotation/'}), 
                title: 'Новый список'
            }).show();
        }
    },
    {
        xtype: 'button',
        text: 'Грибы, лишайники',
        width : 150,
        handler:function(){  
            new formWindow({
                form: new tableRowForm({fields: getFields(lichenesAnnListFields, null, 'lichenes'), baseURL: application_root + '/annotation/'}), 
                title: 'Новый список'
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
            url = application_root + '/anns_download/csv/?taxon_list=' + nodes;
            window.open(url);
        }
    }
]
