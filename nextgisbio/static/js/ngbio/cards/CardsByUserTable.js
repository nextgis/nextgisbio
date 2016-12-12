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
            this.filterForm = dom.byId('formFilter');
            this.searchBtn = dom.byId('search');

            $(this.domNode).jtable({
                title: 'Таблица внесения карточек',
                paging: true,
                sorting: true,
                defaultSorting: '__cards_count DESC',
                actions: {
                    listAction: application_root + '/reports/cards_by_user/jtable/list'
                },
                fields: {
                    person__id: {
                        key: true,
                        list: false
                    },
                    inserter__name: {
                        title: 'Пользователь',
                        width: '16%'
                    },
                    __cards_count: {
                        title: 'Карточек',
                        width: '16%'
                    }
                }
            });

            $(this.domNode).jtable('load');
            this._filterElements = $(this.filterForm).find('[data-filter-item]');

            on(this.searchBtn, 'click', lang.hitch(this, function (e) {
                e.preventDefault();
                this.filterTable();
            }));
        },

        _filterElements: null,
        filterTable: function () {
            var filter = {};
            $.each(this._filterElements, function (i, filterElement) {
                var $filterElement = $(filterElement);
                var value = $filterElement.val();
                if (value) {
                    filter[$filterElement.attr('id')] = value;
                }
            });
            $(this.domNode).jtable('load', filter);
        }
    });
});