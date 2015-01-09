define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/aspect',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojox/data/QueryReadStore',
    'dijit/form/FilteringSelect',
    'dojo/domReady!'
], function (declare, array, lang, aspect, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, QueryReadStore, FilteringSelect) {
    return declare(FilteringSelect, {
        constructor: function (options) {
            declare.safeMixin(this, options);
            if (this.url) {
                this.store = new QueryReadStore({
                    url: application_root + this.url
                });
                // todo: add empty value to store
//                aspect.before(this.store, '_xhrFetchHandler', function(a,b) {
//                    var empty = this._items[0] ? this._items[0] : {};
//                    empty.n = -1;
//                    empty.i = {id: -1, name: ''};
//                    this._items.unshift(empty);
//                });
            } else {
                console.log('JsonFilteringSelect: options.url is not defined');
            }
        }
    });
});