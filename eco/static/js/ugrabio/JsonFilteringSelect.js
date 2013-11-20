define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/store/JsonRest',
    'dijit/form/FilteringSelect',
    'dojo/domReady!'
], function (declare, array, lang, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, JsonRest, FilteringSelect) {



    return declare(FilteringSelect, {
        constructor: function (options) {
            declare.safeMixin(this, options);
            if (this.url) {
                this.store = new JsonRest({
                    target: application_root + this.url
                });
            } else {
                console.log('JsonFilteringSelect: options.url is not defined');
            }
        }
    });
});