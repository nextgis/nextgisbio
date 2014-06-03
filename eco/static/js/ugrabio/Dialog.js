define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/_base/window',
    'dojo/dom',
    'dojo/dom-style',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/dom-form',
    'dojo/query',
    'dojo/request/xhr',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojox/layout/FloatingPane',
    'dijit/form/Form',
    'dojox/layout/TableContainer',
    'dijit/form/Button',
    'dojo/NodeList-traverse',
    'dojo/NodeList-dom'

], function (declare, array, lang, win, dom, domStyle, domClass, domConstruct, domForm, query, xhr, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, FloatingPane, Form, TableContainer, Button) {

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

            if (this.elements && !this.content) {
                this._buildForm(this.elements, this.formSettings);
                this.content = this._form;
            }

            var floatingDiv = domConstruct.create('div', {id: 'dialogFloat_' + id_counter++}, win.body());
            this._dialog = new FloatingPane({
                title: this.title,
                content: this.content,
                resizable: true,
                dockable: false,
                maxable: true,
                style: this.style
            }, floatingDiv);

            if (this.class) {
                domClass.add(this._dialog.domNode, this.class);
            }
        },

        _buildForm: function (elements, formSettings) {
            this._form = new Form(formSettings);

            this._layout = new TableContainer({
                showLabels: true,
                orientation: 'horiz',
                style: 'width: 96%, margin: 5px;'

            });

            array.forEach(elements, lang.hitch(this, function (element) {
                element._dialog = this;
                this._layout.addChild(element);
            }));

            this._layout.placeAt(this._form.containerNode);
            this._layout.startup();

            // todo: create user determining system
            if (this.dialogSettings && this.dialogSettings['submit']) {
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
            if (this._form) {
                this._form.startup();
            }
            this._dialog.startup();
        },

        postCreate: function () {
            this.inherited(arguments);
            query('span.dijitToggleButton', this._dialog.domNode)
                .closest('tr')
                .children('td.tableContainer-labelCell')
                .children('label')
                .style('display', 'none');
        }
    });
});