Ext.Ajax.timeout = 120000; //timeout = 2 минуты


// Событие: на дереве/на карте/в панели поиска/... таксонов поменялся статус выбранных таксонов
taxonEvents = new Ext.util.Observable();
taxonEvents.addEvents('taxonCheckedChange');

// отмеченные таксоны, карточки встреч которых нужно отобразить на карте
// используются при генерации querystring
taxon_nodes = ''; 


// Панель сообщений
addLog = function(message){
    logPanel = Ext.getCmp('messagePanel');
    logPanel.insert(0, { xtype: 'box', autoEl: { html: '<hr/>'} } );
    logPanel.insert(0, { xtype: 'box', autoEl: { cn: message } } );
    logPanel.doLayout();
}

function httpGet(theUrl){
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}
