// Окно для показа форм
// form -- форма для отображения, например:
    //~ new formWindow({
            //~ form: new tableForm({baseURL: 'cards/', recordID: 1, fields: getFields(commonCardFields)}), 
            //~ title: 'Карточка id=1'
        //~ }).show();

formWindow = Ext.extend(Ext.Window, {
    initComponent: function(){
        Ext.apply(this, {
            minWidth: 400,
            minHeight: 100,
            maxHeight: 300,
            width: 500,
            heigth: 200,
            resizable: true,
            autoScroll: true,
            items: [this.form],
            
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
                },
                show : {
                    fn: function(){
                        var formPanel = this.form;
                        if (formPanel.auto) {
                            formPanel.el.mask('Идет загрузка', 'x-mask-loading');
                            formPanel.load({
                                url: formPanel.loadURL,
                                success: function() {
                                    formPanel.el.unmask();
                                },
                                failure: function(form, action) {
                                    formPanel.el.unmask();
                                    Ext.MessageBox.alert('Ошибка', 'Ошибка загрузки формы.');
                                }
                            });
                        };
                    }
                }
            }
        });
        formWindow.superclass.initComponent.call(this);
    }    
});
Ext.reg('formWindow',formWindow);
