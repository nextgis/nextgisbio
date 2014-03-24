<%inherit file='../main.mako'/>

<%block name='inlineRequireAmd'>
    <script>
        require(['ugrabio/Forms', 'ugrabio/Menu', 'ugrabio/TaxonSearcher', 'ugrabio/TaxonCbTree',
            'dojox/data/QueryReadStore', 'dojo/dom', 'dojo/parser', 'dojo/store/JsonRest',
            'dijit/layout/BorderContainer', 'dijit/layout/ContentPane',
            'dijit/Dialog', 'dijit/form/TextBox', 'dijit/form/Button',
            'dijit/form/ValidationTextBox', 'dojo/topic', 'dojo/domReady!',
            'ugrabio/Loader', 'ugrabio/Map', 'ugrabio/Dialog', 'ugrabio/DialogManager',
            'ugrabio/WindowManager', 'dojo/domReady!'],
                function (Forms, Menu, TaxonSearcher, TaxonCbTree) {
                    new Menu(Forms.menuMap, 'menu');
                    new TaxonSearcher(TaxonCbTree);
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
    </div>
</%block>

<%block name='rightPanel'>
    <div class="centerPanel" data-dojo-type="dijit.layout.ContentPane"
         data-dojo-props="region: 'center', title: 'Group 1'">
        <div id="TaxonViewer"><p>Выберите таксон для редактирования слева в дереве таксонов</p></div>
    </div>
</%block>