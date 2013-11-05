<%!
    from pyramid.security import has_permission, ACLAllowed
%>

<script type="text/javascript">

    /* 
     * 
     * Формы
     * 
     */ 
    <%
        can_i_edit = has_permission('edit', request.context, request)
        can_i_edit = isinstance(can_i_edit, ACLAllowed)
    %>

    // Форма отображения таблиц
    // fields   : поля записи, которые следует отобразить на форме
    // адрес, откуда считываются данные по карточкам состоит из двух частей
    // (baseURL/recordID), где
    // recordID : номер записи БД, которую следует отобразить на форме
    // baseURL  : базовый адрес
    tableRowForm = Ext.extend(Ext.form.FormPanel, {
        initComponent: function(){
            Ext.apply(this, {
                auto: this.recordID ? true : false,     // см. formwindow.js
                loadURL: this.baseURL + this.recordID,   // см. formwindow.js
                items: this.fields,
                frame: false,
                bodyStyle: 'padding: 6px',
                labelWidth: 126,
                defaultType : 'textfield',
                defaults: {
                    msgTarget : 'side',
                    anchor: '-20'
                },
                anchor: '100% 100%',
                autoWidth: true,
                listeners: {
                    'beforeaction': function(form, action){
                        speciesField = form.findField(1);
                        originalNameField = form.findField(2);
                        originalNameField.setRawValue(speciesField.getRawValue());
                    }
                }
               
                % if can_i_edit:
                    ,
                        buttons: [{
                        text: 'Сохранить',
                        type: 'submit',
                        scope: this,
                        handler: function(btn, evt){
                            var form = this.getForm();
                            values = form.getValues();
                            if (values.id){
                                url = this.baseURL+values.id+'/save';
                            } else {
                                url = this.baseURL+'new';
                            };
                            if(form.isValid())
                                form.submit({
                                    waitMsg:'Загрузка...',
                                    url: url,
                                    success: function(form, action) {
                                        Ext.MessageBox.alert('Сохранено', 'Успешное сохранение');
                                    },
                                    failure: function(form, action){
                                        var msgwin = Ext.MessageBox.alert('Ошибка', 'Ошибка обработки запроса.');
                                    }
                                });
                        }
                    }]
                % endif
                
            });
            tableRowForm.superclass.initComponent.call(this);
        }    
    });
    Ext.reg('tableRowForm', tableRowForm);

    // Форма выбора таксонов для их отображения на дереве видов
    taxonForm = Ext.extend(Ext.form.FormPanel, {
        initComponent: function(){
            Ext.apply(this, {
                items: [this.taxonCombo],
                frame: false,
                bodyStyle: 'padding: 6px',
                labelWidth: 126,
                defaultType : 'textfield',
                defaults: {
                    msgTarget : 'side',
                    anchor: '-20'
                },
                anchor: '100% 100%'
            });
            taxonForm.superclass.initComponent.call(this);
        }    
    });
    Ext.reg('taxonForm', taxonForm);

</script>



