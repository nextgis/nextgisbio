define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/_base/window',
    'dojo/dom',
    'dojo/dom-construct',
    'dojo/dom-form',
    'dojo/request/xhr',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojox/layout/FloatingPane',
    'dijit/form/Form',
    'dojox/layout/TableContainer',
    'dijit/form/Button'

], function (declare, array, lang, win, dom, domConstruct, domForm, xhr, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, FloatingPane, Form, TableContainer, Button) {

    var id_counter = 0;

    return declare([_WidgetBase], {

        constructor: function (options) {
            declare.safeMixin(this, options);

            if (typeof this.submit === 'undefined') {
                this.submit = true;
            }

            if (!this.style) {
                this.style = 'position:absolute;top:55px;left:5px;height:300px;border:1px solid #759dc0;padding:5px;z-index:9999;overflow-x:hidden;';
            }

            if (this.elements) {
                this._buildForm(this.elements, this.formSettings);
            } else {
                throw ReferenceError;
            }

            var floatingDiv = domConstruct.create('div', {id: 'dialogFloat_' + id_counter++}, win.body());
            this._dialog = new FloatingPane({
                title: this.title,
                content: this._form,
                resizable: true,
                dockable: false,
                maxable: true,
                style: this.style
            }, floatingDiv);
        },

        _buildForm: function (elements, formSettings) {
            this._form = new Form(formSettings);

            this._layout = new TableContainer({
                showLabels: true,
                orientation: 'horiz',
                style: 'width: 100%, margin: 5px;'

            });

            array.forEach(elements, lang.hitch(this, function (element) {
                this._layout.addChild(element);
            }));

            this._layout.placeAt(this._form.containerNode);
            this._layout.startup();

            if (this.submit) {
                var form = this._form,
                    dialog = this._dialog;
                new Button({
                    label: 'Сохранить',
                    style: 'margin: 10px 0 5px 5px;',
                    onClick: function () {
                        if (form.validate()) {
                            var action = application_root + form.action,
                                json_form = domForm.toObject(form.domNode),
                                dialog = dialog;
                            xhr.post(action, {
                                data: json_form,
                                handleAs: 'json'
                            }).then(function (data) {
                                    alert('Данные успешно обновлены!');
                                    dialog.close();
                                }, function (error) {
                                    alert('Извините, произошла ошибка, попробуйте еще раз.');
                                });
                        }
                    }
                }).placeAt(this._form.containerNode);
            }
        },


        show: function () {
            this.inherited(arguments);
            this._form.startup();
            this._dialog.startup();
        }
    });
});