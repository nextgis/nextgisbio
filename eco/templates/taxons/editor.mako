<%inherit file='../main.mako'/>

<%block name='inlineRequireAmd'>
    require(['ugrabio/Forms', 'ugrabio/Menu', 'ugrabio/TaxonSearcher', 'ugrabio/TaxonTree',
        'ugrabio/TaxonEditorManager', 'ugrabio/TaxonViewer',
        'dojox/data/QueryReadStore', 'dojo/dom', 'dojo/parser', 'dojo/store/JsonRest',
        'dijit/layout/BorderContainer', 'dijit/layout/ContentPane',
        'dijit/Dialog', 'dijit/form/TextBox', 'dijit/form/Button',
        'dijit/form/ValidationTextBox', 'dojo/topic', 'dojo/domReady!',
        'ugrabio/Loader',  'ugrabio/Dialog', 'ugrabio/DialogManager',
        'ugrabio/WindowManager', 'dojo/domReady!'],
        function (Forms, Menu, TaxonSearcher, TaxonTree, TaxonEditorManager) {
        ##                new Menu(Forms.menuMap, 'menu');
            new TaxonSearcher(new TaxonTree());
            new TaxonEditorManager();
    });
</%block>

<%block name='leftPanel'>

</%block>

<%block name='rightPanel'>
    <div id="TaxonViewer"></div>
</%block>