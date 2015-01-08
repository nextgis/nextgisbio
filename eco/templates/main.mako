<!DOCTYPE HTML>
<html lang="ru">

    <%
        import json
        from pyramid.security import has_permission, ACLAllowed
    %>

<head>
    <meta charset="utf-8">
    <title>ГИС по объектам животного и растительного мира Ханты-Мансийского автономного округа</title>

    <link rel="icon" type="image/ico" href="${request.static_url('eco:static/favicon.ico')}"/>

    <link rel="stylesheet"
          href="${request.static_url('eco:static/js/lib/dojo-release-1.9.1/dijit/themes/claro/claro.css')}"
          media="screen">

    <link rel="stylesheet"
          href="${request.static_url('eco:static/js/lib/dgrid/css/skins/claro.css')}"/>

    <link rel="stylesheet" href="${request.static_url('eco:static/js/lib/cbtree-v0.9.4-0/icons/indentIcons.css')}"/>

    <link rel="stylesheet" href="${request.static_url('eco:static/js/lib/jstree-3.0.9/themes/ng-bio/style.css')}"/>

    <link rel="stylesheet"
          href="${request.static_url('eco:static/js/lib/dojo-release-1.9.1/dojox/layout/resources/FloatingPane.css')}"/>
    <link rel="stylesheet"
          href="${request.static_url('eco:static/js/lib/dojo-release-1.9.1/dojox/layout/resources/ResizeHandle.css')}"/>
    <link rel="stylesheet"
          href="${request.static_url('eco:static/js/lib/dgrid/css/dgrid.css')}"/>
    <link rel="stylesheet"
          href="${request.static_url('eco:static/js/lib/dropzone/css/basic.css')}"/>
    <link rel="stylesheet"
          href="${request.static_url('eco:static/js/lib/dropzone/css/dropzone.css')}"/>

    <link rel="stylesheet" type="text/css" href="${request.static_url('eco:static/css/main.css')}?${random_int}"
          media="screen">

    <script type="text/javascript">
        window.ugrabio = {};
            %if is_auth:
                window.ugrabio.is_auth = true;
            %endif
            %if is_admin:
                window.ugrabio.mode = 'admin';
            %endif
    </script>

    <script type="text/javascript">
        var application_root = ${request.application_url | json.dumps, n};

        dojoConfig = {
            async: true,
            debug: true,
            cacheBust: true,
            parseOnLoad: true,
            baseUrl: "${request.static_url('eco:static/js/')}",
            locale: "ru-ru",
            packages: [
                {name: 'dojo', location: 'lib/dojo-release-1.9.1/dojo'},
                {name: 'dijit', location: 'lib/dojo-release-1.9.1/dijit'},
                {name: 'dojox', location: 'lib/dojo-release-1.9.1/dojox'},
                {name: 'ugrabio', location: 'ugrabio'},
                {name: 'cbtree', location: 'lib/cbtree-v0.9.4-0'},
                {name: 'dgrid', location: 'lib/dgrid'},
                {name: 'put-selector', location: 'lib/put-selector'},
                {name: 'xstyle', location: 'lib/xstyle'},
                {name: 'mustache', location: 'lib/mustache'},
                {name: 'jssor', location: 'lib/jssor'},
                {name: 'dropzone', location: 'lib/dropzone'},
                {name: 'jstree', location: 'lib/jstree-3.0.9'}
            ]
        };
    </script>
    <script type="text/javascript" src="${request.static_url('eco:static/js/lib/dojo-release-1.9.1/dojo/dojo.js')}"></script>
    <script type="text/javascript" src="${request.static_url('eco:static/js/lib/jquery-1.11.2/jquery.js')}"></script>


    ##    <script src="http://maps.google.com/maps/api/js?v=3.6&amp;sensor=false"></script>

    <script src="https://maps.google.com/maps/api/js?sensor=false"></script>

    <script src="${request.static_url('eco:static/js/lib/openlayers/OpenLayers.js')}" type="text/javascript"></script>

    <%block name='inlineRequireAmd'>
        <script>
            require(['ugrabio/Forms', 'ugrabio/Menu', 'ugrabio/TaxonSearcher', 'ugrabio/TaxonCbTree',
                        'ugrabio/TaxonJsTree',
                        'dojox/data/QueryReadStore', 'dojo/dom', 'dojo/parser', 'dojo/store/JsonRest',
                        'dijit/layout/BorderContainer', 'dijit/layout/ContentPane',
                        'dijit/Dialog', 'dijit/form/TextBox', 'dijit/form/Button',
                        'dijit/form/ValidationTextBox', 'dojo/topic', 'dojo/domReady!',
                        'ugrabio/Loader', 'ugrabio/Map', 'ugrabio/Dialog', 'ugrabio/DialogManager',
                        'ugrabio/WindowManager',  'dojo/domReady!'],
                    function (Forms, Menu, TaxonSearcher, TaxonCbTree, TaxonJsTree) {
                        new Menu(Forms.menuMap, 'menu');
                        new TaxonSearcher();
                        new TaxonJsTree('#taxonJsTree');
                    });
        </script>
    </%block>
</head>
<body class="claro loading">
<div class="loader">
    <p>Инициализация ГИС...</p>
</div>
<div id="appLayout" class="demoLayout" data-dojo-type="dijit.layout.BorderContainer"
     data-dojo-props="design: 'headline'">

    <%block name='rightPanel'>
        <div class="centerPanel" data-dojo-type="dijit.layout.ContentPane"
             data-dojo-props="region: 'center', title: 'Group 1'">
            <div id="map"></div>
        </div>
    </%block>

    <div class="edgePanel" data-dojo-type="dijit.layout.ContentPane" data-dojo-props="region: 'top'">
        <%block name="topPanel">
            <div id="menu"></div>
        </%block>
        <div class="user-data">
            %if is_auth:
                <button id="logoutButton" data-dojo-type="dijit/form/Button" type="button"
                        onClick="location.href='${request.route_url('logout')}';">
                    Выйти
                </button>
            %else:
                <button id="loginButton" data-dojo-type="dijit/form/Button" type="button" onClick="loginDialog.show();">
                    Войти
                </button>
            %endif
        </div>
    </div>

    <%block name='middlePanel'>
        <div class="edgePanel" data-dojo-type="dijit.layout.ContentPane" data-dojo-props="region: 'top'">
            Таксон: <input id="search"/>
        </div>
    </%block>

    <%block name='leftPanel'>
        <div>
            <div id="leftCol" class="edgePanel" data-dojo-type="dijit.layout.ContentPane"
                 data-dojo-props="region: 'left', splitter: true">
                <a class="filter" style="padding-right: 15px;" href="javascript:void(0)">Фильтр</a>
                <a class="clear" href="javascript:void(0)">Снять выделение</a>
                <div id="taxonJsTree"></div>
            </div>
        </div>
    </%block>
</div>

<div data-dojo-type="dijit/Dialog" data-dojo-id="loginDialog" title="Вход">
    <form method="post" action="${request.route_url('login')}">
        <input type="hidden" value="1" name="form.submitted">
        <table class="dijitDialogPaneContentArea">
            <tr>
                <td><label for="login">Логин:</label></td>
                <td><input data-dojo-type="dijit/form/TextBox" name="login" id="login"></td>
            </tr>
            <tr>
                <td><label for="password">Пароль:</label></td>
                <td><input type="password" data-dojo-type="dijit/form/ValidationTextBox" name="password" id="password">
                </td>
            </tr>
        </table>
        <div class="dijitDialogPaneActionBar">
            <button data-dojo-type="dijit/form/Button" type="submit">Вход</button>
        </div>
    </form>
</div>

<div data-dojo-type="dijit/Dialog" id="filterDialog" title="Фильтры">
    <form method="get" action="${request.application_url | json.dumps, n}">
        <input name="taxons" type="hidden" value=""/>
        <table class="dijitDialogPaneContentArea">
            <tr>
                <td><label for="red_book">Красная книга:</label></td>
                <td>
                    <select id="filter_red_book" name="red_book" data-dojo-type="dijit/form/Select">
                        <option value="-1" ${'selected="selected"' if red_book_selected_id == -1 else ''}>Не выбран
                        </option>
                        % for red_book in red_books:
                            <option value="${red_book.id}" ${'selected="selected"' if red_book_selected_id == red_book.id else ''}>${red_book.name}</option>
                        % endfor
                    </select>
                </td>
            </tr>
        </table>
        <div class="dijitDialogPaneActionBar">
            <button data-dojo-type="dijit/form/Button" type="submit">Применить фильтр</button>
        </div>
    </form>
</div>

</body>
</html>