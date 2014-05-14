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
    'mustache/mustache',
    'dgrid/List',
    'dgrid/OnDemandGrid',
    'dgrid/Selection',
    'dgrid/editor',
    'dgrid/Keyboard',
    'dojo/store/JsonRest',
    'dojo/store/Observable',
    'dojo/store/Cache',
    'dojo/store/Memory',
    'dojo/domReady!'
], function (declare, lang, array, domForm, xhr, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, query, topic, Form, Button, TextBox, ValidationTextBox, TableContainer, Dialog, template, mustache, List, Grid, Selection, editor, Keyboard, JsonRest, Observable, Cache, Memory) {

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
        },

        synonymsCreatorElements = {
            synonym: {
                title: 'Название синонима',
                getElement: function () {
                    return new ValidationTextBox({
                        required: true
                    });
                }
            },

            author: {
                title: 'Автор',
                getElement: function () {
                    return new TextBox({});
                }
            },

            source: {
                title: 'Источник',
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
            var divButtons = query('div.buttons', this.domNode)[0],
                synonymsTable = query('div.synonyms', this.domNode)[0];

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

            this._buildSynonymsTable(synonymsTable, this.id);

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
            new Dialog({
                title: title,
                content: content,
                onHide: function () {
                    this.destroyRecursive();
                }
            }).show();
        },

        _buildSynonymsTable: function (synonymsTable, taxonId) {
            var synonymsStore = Observable(Cache(JsonRest({
                target: application_root + '/taxons/synonyms/' + taxonId + '/',
                idProperty: 'id'
            }), Memory()));

            var columns = [
                {label: 'Синоним', field: 'synonym', sortable: false},
                {label: 'Автор', field: 'author', sortable: false},
                {label: 'Источник', field: 'source', sortable: false}
            ];

            this._synonymsGrid = new (declare([Grid, Selection, Keyboard]))({
                selectionMode: 'single',
                id: 'synonymsGrid',
                sort: 'id',
                store: synonymsStore,
                className: "dgrid-autoheight",
                getBeforePut: false,
                columns: columns
            }, synonymsTable);

            this.nestedElements.push(this._synonymsGrid);

            this._buildSynonymsButtons(taxonId, synonymsStore, this._synonymsGrid);
        },

        _buildSynonymsButtons: function (taxon_id, store, grid) {
            var synonymsButtonsSection = query('div.synonym-buttons', this.domNode)[0];

            var addButton = new Button({
                label: "Добавить синоним",
                onClick: lang.hitch(this, function () {
                    this.showCreateSynonymDialog(taxon_id);
                })
            });
            this.nestedElements.push(addButton);
            addButton.placeAt(synonymsButtonsSection);

            var deleteButton = new Button({
                label: 'Удалить синоним',
                onClick: lang.hitch(this, function () {
                    var isDeleting = confirm('Вы уверены, что хотите удалить синоним?');
                    if (isDeleting) {
                        for (var i in grid.selection) {
                            store.remove(i);
                        }
                    }
                })
            });
            this.nestedElements.push(deleteButton);
            deleteButton.placeAt(synonymsButtonsSection);

            var saveButton = new Button({
                label: 'Сохранить таблицу синонимов',
                onClick: lang.hitch(this, function () {
                    var isSaving = confirm('Вы уверены, что хотите сохранить текущую таблицу синонимов?');
                    if (isSaving) {
                        grid.save();
                    }
                })
            });
            this.nestedElements.push(saveButton);
            saveButton.placeAt(synonymsButtonsSection);

            var revertButton = new Button({
                label: 'Сбросить правки',
                onClick: lang.hitch(this, function () {
                    var isReverting = confirm('Вы уверены, что хотите отменить правки в таблице синонимов?');
                    if (isReverting) {
                        grid.revert();
                    }
                })
            });
            this.nestedElements.push(revertButton);
            revertButton.placeAt(synonymsButtonsSection);

        },

        showCreateSynonymDialog: function (taxon_id) {
            var layout = new TableContainer({
                    showLabels: true,
                    orientation: 'horiz'
                }),
                elementTemplateName, elementTemplate, element;

            for (elementTemplateName in synonymsCreatorElements) {
                if (synonymsCreatorElements.hasOwnProperty(elementTemplateName)) {
                    elementTemplate = synonymsCreatorElements[elementTemplateName];
                    element = elementTemplate.getElement();
                    if (elementTemplate.title) {
                        element.title = elementTemplate.title;
                    }
                    element.set('name', elementTemplateName);
                    layout.addChild(element);
                }
            }

            this._form = new Form();
            layout.placeAt(this._form.containerNode);
            layout.startup();

            new Button({
                label: 'Создать новый синоним',
                onClick: lang.hitch(this, function () {
                    if (this._form.validate()) {
                        this.createSynonym(taxon_id);
                    }
                })
            }).placeAt(this._form.containerNode);


            this._dialog = new Dialog({
                title: 'Создать новый синоним таксона',
                content: this._form,
                onHide: function () {
                    this.destroyRecursive();
                }
            });

            this._dialog.show();
        },

        createSynonym: function (taxon_id) {
            var action = application_root + '/taxons/synonyms/'+ taxon_id + '/new',
                json_form = domForm.toObject(this._form.domNode),
                options = {
                    data: json_form,
                    handleAs: 'json'
                };

            xhr.put(action, options).then(lang.hitch(this, function (data) {
                this._dialog.hide();
                this._synonymsGrid.update();
            }), function (error) {
                this._errorHandler();
            });
        }
    });
});