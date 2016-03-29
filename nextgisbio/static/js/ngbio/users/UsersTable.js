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
                    listAction: application_root + '/persons/manager/jtable/list',
                    createAction: application_root + '/persons/manager/jtable/save',
                    updateAction: application_root + '/persons/manager/jtable/save',
                    deleteAction: application_root + '/persons/manager/jtable/delete'
                },
                fields: {
                    person_id: {
                        key: true,
                        list: false
                    },
                    person_name: {
                        title: 'ФИО',
                        width: '16%'
                    },
                    user_login: {
                        title: 'Логин',
                        width: '16%'
                    },
                    user_role: {
                        title: 'Роль',
                        width: '16%',
                        options: {'editor': 'Редактор', 'admin': 'Администратор', 'user': 'Пользователь'}
                    },
                    user_password: {
                        title: 'Пароль',
                        width: '16%',
                        type: 'password',
                        list: false
                    },
                    user_active: {
                        title: 'Активный',
                        width: '16%',
                        type: 'checkbox',
                        values: {'false': 'Неактивный', 'true': 'Активный'}
                    },
                    person_degree: {
                        title: 'Степень',
                        width: '14%'
                    },
                    person_organization: {
                        title: 'Организация',
                        width: '14%'
                    },
                    person_email: {
                        title: 'E-mail',
                        width: '14%'
                    },
                    person_phone: {
                        title: 'Тел.',
                        width: '14%'
                    },
                    person_address: {
                        title: 'Адрес',
                        width: '14%'
                    },
                    person_speciality: {
                        title: 'Специализация',
                        width: '14%'
                    }
                },
                formCreated: function (event, data) {
                    data.form.find('input[name="person_name"]').addClass('validate[required]');
                    data.form.find('input[name="user_login"]').addClass('validate[required]');
                    data.form.find('input[name="user_password"]').addClass('validate[required]');
                    data.form.validationEngine();
                },
                formSubmitting: function (event, data) {
                    return data.form.validationEngine('validate');
                },
                formClosed: function (event, data) {
                    data.form.validationEngine('hide');
                    data.form.validationEngine('detach');
                }
            });

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