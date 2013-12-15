define('ugrabio/TaxonViewer', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-form',
    'dojo/request/xhr',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/query',
    'dojo/topic',
    'dijit/form/Form',
    'dijit/form/Button',
    'dijit/form/TextBox',
    'dijit/form/ValidationTextBox',
    'dojox/layout/TableContainer',
    'dijit/Dialog',
    'dojo/text!./templates/TaxonViewer.html',
    'mustache/mustache'
], function (declare, lang, array, domForm, xhr, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, query, topic, Form, Button, TextBox, ValidationTextBox, TableContainer, Dialog, template, mustache) {

    var taxonTypes = {
            'Kingdom': {
                rus_name: 'Царство',
                create_buton_label: 'Добавить новый тип',
                next_type: 'Phylum'
            },
            'Phylum': {
                rus_name: 'Тип',
                create_buton_label: 'Добавить новый класс',
                next_type: 'Class'
            },
            'Class': {
                rus_name: 'Класс',
                create_buton_label: 'Добавить новый порядок',
                next_type: 'Order'
            },
            'Order': {
                rus_name: 'Порядок',
                create_buton_label: 'Добавить новое семейство',
                next_type: 'Family'
            },
            'Family': {
                rus_name: 'Семейство',
                create_buton_label: 'Добавить новый род',
                next_type: 'Genus'
            },
            'Genus': {
                rus_name: 'Род',
                create_buton_label: 'Добавить новый вид',
                next_type: 'Species'
            },
            'Species': {
                rus_name: 'Вид'
            }
        },
        elements = {
            id: {
                getElement: function () {
                    return new TextBox({
                        type: 'hidden'
                    });
                }
            },

            parent_id: {
                getElement: function () {
                    return new TextBox({
                        type: 'hidden'
                    });
                }
            },

            taxon_type: {
                getElement: function () {
                    return new TextBox({
                        type: 'hidden'
                    });
                }
            },

            name: {
                title: 'Название',
                getElement: function () {
                    return new ValidationTextBox({
                        required: true
                    });
                }
            },

            russian_name: {
                title: 'Русское название',
                getElement: function () {
                    return new TextBox({});
                }
            },

            source: {
                title: 'Источник',
                getElement: function () {
                    return new TextBox({});
                }
            },

            author: {
                title: 'Автор',
                getElement: function () {
                    return new TextBox({});
                }
            }
        }

    return declare('TaxonViewer', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,

        constructor: function (taxon) {
            lang.mixin(this, taxon);
            this._skipNodeCache = true;
            this.taxon_type_description = taxonTypes[this.taxon_type];
            this.nestedElements = [];
        },

        _stringRepl: function (tmpl) {
            return mustache.render(tmpl, this);
        },

        destroy: function () {
            this.inherited(arguments);
            array.forEach(this.nestedElements, function (nestedElement) {
                nestedElement.destroy();
            });
        },

        startup: function () {
            this.inherited(arguments);
            var divButtons = query('div.buttons', this.domNode)[0];

            var editButton = new Button({
                label: "Редактировать",
                onClick: lang.hitch(this, function () {
                    this.showEditDialog(true);
                })
            });
            this.nestedElements.push(editButton);
            editButton.placeAt(divButtons);

            if (this.taxon_type_description.create_buton_label) {
                var createButton = new Button({
                    label: this.taxon_type_description.create_buton_label,
                    onClick: lang.hitch(this, function () {
                        this.showEditDialog(false);
                    })
                });
                this.nestedElements.push(createButton);
                createButton.placeAt(divButtons);
            }


            var deleteButton = new Button({
                label: 'Удалить таксон',
                onClick: lang.hitch(this, function () {
                    var isDeleting = confirm('Вы уверены, что хотите удалить таксон?');
                    if (isDeleting) {
                        this._deleteTaxon(this.id);
                    }
                })
            });
            this.nestedElements.push(deleteButton);
            deleteButton.placeAt(divButtons);

        },

        showEditDialog: function (isUpdating) {
            var layout = new TableContainer({
                    showLabels: true,
                    orientation: 'horiz'
                }),
                elementTemplateName, elementTemplate, element;

            for (elementTemplateName in elements) {
                if (elements.hasOwnProperty(elementTemplateName)) {
                    elementTemplate = elements[elementTemplateName];
                    element = elementTemplate.getElement();
                    if (elementTemplate.title) {
                        element.title = elementTemplate.title;
                    }
                    element.set('name', elementTemplateName);
                    if (isUpdating) {
                        element.set('value', this[elementTemplateName]);
                    } else if (!isUpdating && elementTemplateName === 'parent_id') {
                        element.set('value', this.id);
                    } else if (!isUpdating && elementTemplateName === 'taxon_type') {
                        element.set('value', taxonTypes[this.taxon_type].next_type);
                    }
                    layout.addChild(element);
                }
            }

            this._form = new Form();
            layout.placeAt(this._form.containerNode);
            layout.startup();

            var buttonLabel = isUpdating ? 'Сохранить' : this.taxon_type_description.create_buton_label
            new Button({
                label: buttonLabel,
                onClick: lang.hitch(this, function () {
                    if (this._form.validate()) {
                        this._changeTaxon(isUpdating);
                    }
                })
            }).placeAt(this._form.containerNode);


            this._dialog = new Dialog({
                title: isUpdating ? 'Редактирование ' + this.name : this.taxon_type_description.create_buton_label,
                content: this._form,
                onHide: function () {
                    this.destroyRecursive();
                }
            });

            this._dialog.show();
        },

        _changeTaxon: function (isUpdating) {
            var action = application_root + '/tree/taxons/',
                json_form = domForm.toObject(this._form.domNode),
                options = {
                    data: json_form,
                    handleAs: 'json'
                },
                changeHandler;


            if (isUpdating == true) {
                changeHandler = xhr.post(action, options)
            } else if (isUpdating == false) {
                changeHandler = xhr.put(action, options)
            }

            changeHandler.then(lang.hitch(this, function (data) {
                this._dialog.hide();
                this._updatePage(data.item.id);
            }), function (error) {
                this._errorHandler();
            });
        },

        _deleteTaxon: function (id) {
            var action = application_root + '/tree/taxons/',
                options = {
                    data: {id: id},
                    handleAs: 'json'
                };

            xhr.del(action, options).then(lang.hitch(this, function (data) {
                this._updatePage(data.id);
            }), lang.hitch(this, function (data) {
                var errorData = data.response.data;
                if (errorData.error && errorData.error === 'IntegrityError') {
                    this._errorHandler('Таксон не может быть удален, так как содержит вложенные таксоны.');
                } else {
                    this._errorHandler();
                }
            }));
        },

        _updatePage: function (taxon_id) {
            new Dialog({
                title: 'Статус',
                content: 'Данные успешно обновлены, страница перезагружается...',
                closable: false
            }).show();
            setTimeout(function () {
                window.open(application_root + '/taxons/editor?taxon_id=' + taxon_id, '_self', false);
            }, 2000);
        },

        _errorHandler: function (content, title) {
            content = content ? content : 'Извините, произошла ошибка, попробуйте еще раз.';
            title = title ? title : 'Ошибка';
            var errorDialog = new Dialog({
                title: title,
                content: content,
                onHide: function () {
                    this.destroyRecursive();
                }
            }).show();
        }
    });
});