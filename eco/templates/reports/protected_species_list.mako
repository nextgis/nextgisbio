<%inherit file='../main.mako'/>

<%block name='inlineRequireAmd'>
    <script>
        require(['ugrabio/RedBookSearcher',
            'dojo/store/Memory',
            'dojo/store/JsonRest',
            'dojo/store/Cache',
            'dojo/store/Observable',
            'dgrid/OnDemandGrid',
            'dojo/dom-construct',
            'dojo/parser',
            'ugrabio/Loader',
            'dijit/layout/BorderContainer',
            'dijit/layout/ContentPane',
            'dojo/domReady!'],
                function (RedBookSearcher, Memory, JsonRest, Cache, Observable, OnDemandGrid, domConstruct) {
                    var redBookSearcher = new RedBookSearcher();

                    var contentMemoryStore = new Memory();
                    var contentJsonRestStore = new JsonRest();

                    var contentStore = new Cache(contentJsonRestStore, contentMemoryStore);

                    var store = new Observable(contentStore);

                    redBookSearcher._comboBox.watch('item', function (what, oldVal, newVal) {
                        domConstruct.empty('grid');
                        contentJsonRestStore.target = application_root + '/species/redbook/' + newVal.i.id;

                        var grid = new OnDemandGrid({
                            store: store,
                            columns: {
                                name: 'Латинское название',
                                russian_name: 'Русское название',
                                status: 'Статус по книге',
                                univ_status: 'Универсальный статус',
                                region: 'Регион',
                                population: 'Популяция',
                                year: 'Год'
                            }
                        }, 'grid');


                        grid.startup();
                    });
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
        Красная книга: <input id="search"/>
    </div>
</%block>

<%block name='leftPanel'>

</%block>

<%block name='rightPanel'>
    <div class="centerPanel" data-dojo-type="dijit.layout.ContentPane"
         data-dojo-props="region: 'center', title: 'Group 1'">
        <div id="grid" style="height: 99%"><p>Выберите Красную книгу для построения таблицы</p></div>
    </div>
</%block>