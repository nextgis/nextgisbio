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
    'dojo/topic',
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
], function (declare, array, lang, win, dom, domStyle, domClass, domConstruct, domForm, topic, query, xhr,
             _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, FloatingPane,
             Form, TableContainer, Button) {

    var id_counter = 0;

    return declare([_WidgetBase], {

        constructor: function (options) {
            declare.safeMixin(this, options);

            if (!this.dialogSettings) {
                this.dialogSettings = {};
            }

            if (!this.dialogSettings['submit'] || typeof this.dialogSettings['submit'] === 'undefined') {
                if (window.ngbio.is_auth) {
                    this.dialogSettings['submit'] = true;
                }
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

            if (this['class']) {
                domClass.add(this._dialog.domNode, this['class']);
            }
        },

        _getDialog: function () {
            return this._dialog;
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
                    theDialog = this;
                new Button({
                    label: 'Сохранить',
                    style: 'margin: 10px 0 5px 5px;',
                    onClick: function () {
                        if (form.validate()) {
                            var json_form = domForm.toObject(form.domNode),
                                action = application_root + '/' + form.action,
                                dialog = theDialog._getDialog();

                            if (json_form.id) {
                                action = action + '/' + json_form.id;
                                xhr.post(action, {
                                    data: json_form,
                                    handleAs: 'json'
                                }).then(function (data) {
                                    alert('Данные успешно обновлены!');
                                    dialog.close();
                                }, function (error) {
                                    alert('Извините, произошла ошибка, попробуйте еще раз.');
                                });
                            } else {
                                action = action + '/' + 'new';
                                xhr.put(action, {
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
                    }
                }).placeAt(this._form.containerNode);

                new Button({
                    label: 'Удалить',
                    style: 'margin: 10px 0 5px 5px;',
                    onClick: function () {
                        var json_form = domForm.toObject(form.domNode),
                            action = application_root + '/' + form.action + '/' + json_form.id,
                            dialog = theDialog._getDialog();
                        xhr.del(action, {
                            data: json_form,
                            handleAs: 'json'
                        }).then(function (data) {
                            alert('Объект успешно удален!');
                            if (action.indexOf('annotation') !== -1) {
                                topic.publish('/annotation/list/update');
                            }
                            dialog.close();
                        }, function (error) {
                            alert('Извините, произошла ошибка, попробуйте еще раз.');
                        });
                    }
                }).placeAt(this._form.containerNode);

                if (domForm.toObject(form.domNode).id && theDialog.formSettings.action === 'card') {
                    new Button({
                        label: 'PDF',
                        style: 'margin: 10px 0 5px 5px;',
                        onClick: lang.hitch(this, function () {
                            this._export_card_to_file(form, theDialog, 'pdf');
                        })
                    }).placeAt(this._form.containerNode);
                    new Button({
                        label: 'DOCX',
                        style: 'margin: 10px 0 5px 5px;',
                        onClick: lang.hitch(this, function () {
                            this._export_card_to_file(form, theDialog, 'docx');
                        })
                    }).placeAt(this._form.containerNode);
                    new Button({
                        label: 'CSV',
                        style: 'margin: 10px 0 5px 5px;',
                        onClick: lang.hitch(this, function () {
                            this._export_card_to_file(form, theDialog, 'csv');
                        })
                    }).placeAt(this._form.containerNode);
                }
            }
        },

        _export_card_to_file: function (form, theDialog, format) {
            var json_form = domForm.toObject(form.domNode),
                action = application_root + '/export/cards/?format=csv',
                dialog = theDialog._getDialog(),
                temporaryForm,
                $temporaryForm;

            temporaryForm = $(dialog.domNode).find('form.temporaryForm')[0];
            if (!temporaryForm) {
                $(dialog.domNode).append('<form class="temporaryForm"></form>');
                temporaryForm = $(dialog.domNode).find('form.temporaryForm')[0];
            }

            $temporaryForm = $(temporaryForm);

            $temporaryForm.attr('action', application_root + '/export/cards/?format=' + format);
            $temporaryForm.attr('method', 'POST');
            $temporaryForm.append('<input type="hidden" name="cards__id__int__equal" value="' + json_form.id + '" />');
            $temporaryForm.submit();
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