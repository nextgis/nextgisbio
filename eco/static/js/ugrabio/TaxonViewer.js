define('ugrabio/TaxonViewer', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./templates/TaxonViewer.html',
    'mustache/mustache'
], function (declare, lang, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, mustache) {

    var taxonTypes = {
        'Kingdom': 'Царство',
        'Phylum': 'Тип',
        'Class': 'Класс',
        'Order': 'Порядок',
        'Family': 'Семейство',
        'Genus': 'Род',
        'Species': 'Вид'
    }

    return declare('TaxonViewer', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,

        constructor: function(taxon) {
            lang.mixin(this, taxon);
            this._skipNodeCache = true;
            this.taxonType = taxonTypes[this.taxon_type];
        },

        _stringRepl: function(tmpl) {
            return mustache.render(tmpl, this);
        }
    });
});