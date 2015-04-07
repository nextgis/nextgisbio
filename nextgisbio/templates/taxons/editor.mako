<%inherit file='../main.mako'/>

<%block name='inlineRequireAmd'>
    <script>
        require(['ngbio/Forms', 'ngbio/TaxonSearcher', 'ngbio/TaxonEditorTree',
                    'ngbio/TaxonEditorManager', 'ngbio/TaxonViewer',
                    'dojox/data/QueryReadStore', 'dojo/dom', 'dojo/parser', 'dojo/store/JsonRest',
                    'dijit/layout/BorderContainer', 'dijit/layout/ContentPane',
                    'dijit/Dialog', 'dijit/form/TextBox', 'dijit/form/Button',
                    'dijit/form/ValidationTextBox', 'dojo/topic', 'dojo/domReady!',
                    'ngbio/Loader', 'ngbio/Dialog', 'ngbio/DialogManager',
                    'ngbio/WindowManager', 'dojo/domReady!'],
                function (Forms, TaxonSearcher, TaxonEditorTree, TaxonEditorManager) {
                    new TaxonEditorTree('#taxonJsTree');
                    new TaxonEditorManager();
                });
    </script>
</%block>

<%block name="topPanel">
    <button data-dojo-type="dijit/form/Button" type="button">&larr; Вернуться на карту
        <script type="dojo/on" data-dojo-event="click" data-dojo-args="evt">
            window.open(application_root + '/', '_self');

        </script>
    </button>
</%block>

<%block name='middlePanel'>
    <div class="edgePanel" data-dojo-type="dijit.layout.ContentPane" data-dojo-props="region: 'top'">
        Таксон: <input id="search"/>
    </div>
</%block>

<%block name='leftPanel'>
    <div id="leftCol" class="edgePanel" data-dojo-type="dijit.layout.ContentPane"
         data-dojo-props="region: 'left', splitter: true">
        <div class="tree-wrapper">
            <div id="taxonJsTree"></div>
        </div>
    </div>
</%block>

<%block name='rightPanel'>
    <div class="centerPanel" data-dojo-type="dijit.layout.ContentPane"
         data-dojo-props="region: 'center', title: 'Group 1'">
        <div id="TaxonViewer"><p>Выберите таксон для редактирования слева в дереве таксонов</p></div>
    </div>
</%block>