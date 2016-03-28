define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/dom',
    'dojo/on',
    'dojo/dom-attr',
    'dojo/_base/array',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin'
], function (declare, lang, topic, dom, on, domAttr, array, _WidgetBase,
             _TemplatedMixin) {
    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: '<div></div>',

        postCreate: function (kwArgs) {
            this.searchText = dom.byId('searchText');
            this.searchBtn = dom.byId('search');
            this.searchFields = domAttr.get(this.searchBtn, 'data-search');

            $(this.domNode).jtable({
                title: 'Таблица исследователей',
                paging: true,
                sorting: true,
                defaultSorting: 'Name ASC',
                actions: {
                    listAction: application_root + '/person/jtable',
                    createAction: application_root + '/person/jtable/save',
                    updateAction: application_root + '/person/jtable/save',
                    deleteAction: application_root + '/person/jtable/delete'
                },
                fields: {
                    id: {
                        key: true,
                        list: false
                    },
                    name: {
                        title: 'ФИО',
                        width: '16%'
                    },
                    user: {
                        title: 'Логин',
                        options: application_root + '/persons/manager/users',
                        list: false
                    },
                    degree: {
                        title: 'Степень',
                        width: '14%'
                    },
                    organization: {
                        title: 'Организация',
                        width: '14%'
                    },
                    email: {
                        title: 'E-mail',
                        width: '14%'
                    },
                    phone: {
                        title: 'Тел.',
                        width: '14%'
                    },
                    address: {
                        title: 'Адрес',
                        width: '14%'
                    },
                    speciality: {
                        title: 'Специализация',
                        width: '14%'
                    }
                }
            })
            ;
            $(this.domNode).jtable('load');

            on(dom.byId('search'), 'click', lang.hitch(this, function (e) {
                e.preventDefault();
                $(this.domNode).jtable('load', {
                    filter: domAttr.get(this.searchText, 'value'),
                    filter_fields: this.searchFields
                });
            }));
        }
    });
});