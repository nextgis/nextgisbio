<%!
    from pyramid.security import has_permission, ACLAllowed
%>
<script type="text/javascript">
    <%
        can_i_edit = has_permission('edit', request.context, request)
        can_i_edit = isinstance(can_i_edit, ACLAllowed)
        can_i_admin = has_permission('admin', request.context, request)
        can_i_admin = isinstance(can_i_admin, ACLAllowed)
    %>

var menuToolbar = [
        % if can_i_edit:
        {
            
            <%include file="cardsmenu.js"/>
        },
        {
            <%include file="annlistmenu.js"/>
        },
        {
            <%include file="kareal.js"/>
        },
        '-',
        % endif
        % if can_i_admin:
        {
            
            <%include file="exportadminmenu.js"/>
        },
        '-',
        % endif
    {
       xtype: 'tbfill'
    },
    {
        xtype: 'button',
        text: 'Вход',
        handler:function(){  
            new Ext.Window({
                title: 'Вход',
                autoLoad: {
                   url: application_root + '/login',
                   scripts: true
                },
                width : 200,
                height: 120
            }).show();
        }
    },
    '-',
    {
        xtype: 'box',
        autoEl: {tag: 'a', href: application_root + '/logout', html: 'Выход'}
    }
];


Ext.onReady(function() {
    
    Ext.util.Cookies.clear('checkedTaxons');
    
    map = createMap();
    
    new Ext.Viewport({
        layout: 'border',
        defaults: {
            frame : true,
            split : true
        },
        items : [
            {// Шапка
                xtype: 'panel',
                id: 'NorthPanel',
                title: 'Панель инструментов',
                region: 'north',
                items: [
                    new taxonForm({taxonCombo: taxonCombo, loadURL: application_root + '/taxon_view/'})
                ],
                layout: 'fit',
                height: 85,
                tbar: menuToolbar
            },{// Выбор слоев будет тут
                id: 'westContainer',
                xtype: 'panel',
                region: 'west',
                layout: 'table',
                layoutConfig: {
                    columns: 1
                },
                minWidth: 15,
                width: 150,
                collapsible : true,
                coolapsmode: 'mini',
                split: true,
                autoScroll:true
            },{// Карта будет тут
                id: 'mappanel',
                xtype: 'gx_mappanel',
                region: 'center',
                layout: 'fit',
                center: map.center,
                zoom: map.startZoom,
                map: map
            },{// Панель сообщений
                id: 'messagePanel',
                title: 'Сообщения',
                region: 'south',
                height: 75,
                split: true,
                collapsible : true,
                coolapsmode: 'mini',
                autoScroll:true
            }
        ]
    });
    
    // Заполняеем контейнеры элементами UI
    mapPanel = Ext.getCmp('mappanel');
    var layerList = new GeoExt.tree.LayerContainer({
        text: 'Доступные слои',
        layerStore: mapPanel.layers,
        leaf: false,
        expanded: true
    });

    var layerTree = new Ext.tree.TreePanel({
        title: 'Слои',
        root: layerList
    });
    
    wcont = Ext.getCmp('westContainer');
    wcont.add(layerTree);
    tree = taxontree();
    wcont.add(tree);
    wcont.doLayout();
});

</script>

