define('ngbio/TaxonEditorTree', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/Deferred',
    'dojo/request/xhr',
    'jstree/jstree',
    'dojo/text!./templates/SpecieTreeNodeTemplate.html',
    'mustache/mustache'
], function (declare, lang, topic, Deferred, xhr, jstree, specieTreeNodeTemplate, mustache) {
    return declare('TaxonEditorTree', [], {

    });
});