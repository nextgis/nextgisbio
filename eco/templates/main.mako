<!DOCTYPE HTML>
<html lang="ru">

    <%
        import json
        from pyramid.security import has_permission, ACLAllowed
    %>

<head>
    <meta charset="utf-8">
    <title>ГИС по объектам животного и растительного мира Ханты-Мансийского автономного округа</title>

    <link rel="stylesheet" type="text/css"
          href="${request.static_url('eco:contrib/geoext/resources/css/geoext-all-debug.css')}" media="screen">
    <link rel="stylesheet"
          href="${request.static_url('eco:static/js/lib/dojo-release-1.9.1/dijit/themes/claro/claro.css')}"
          media="screen">
    <link rel="stylesheet" href="${request.static_url('eco:static/js/lib/cbtree-v0.9.4-0/icons/indentIcons.css')}" />
    <link rel="stylesheet" type="text/css" href="${request.static_url('eco:static/css/main.css')}" media="screen">

    <script type="text/javascript">
        var application_root = ${request.application_url | json.dumps, n};
    </script>


    <script type="text/javascript">
        dojoConfig = {
            async: true,
            parseOnLoad: true,
            baseUrl: "${request.static_url('eco:static/js/')}",
            locale: "ru-ru",
            packages: [
                {name: 'dojo', location: 'lib/dojo-release-1.9.1/dojo'},
                {name: 'dijit', location: 'lib/dojo-release-1.9.1/dijit'},
                {name: 'dojox', location: 'lib/dojo-release-1.9.1/dojox'},
                {name: 'ugrabio', location: 'ugrabio'},
                {name: 'cbtree', location: 'lib/cbtree-v0.9.4-0'}
            ]
        };
    </script>
    <script type="text/javascript"
            src="${request.static_url('eco:static/js/lib/dojo-release-1.9.1/dojo/dojo.js')}"></script>

    <script src="${request.static_url('eco:contrib/extjs/adapter/ext/ext-base.js')}" type="text/javascript"></script>
    <script src="${request.static_url('eco:contrib/extjs/ext-all.js')}" type="text/javascript"></script>
    <script src="http://maps.google.com/maps/api/js?v=3.6&amp;sensor=false"></script>
    <script src="${request.static_url('eco:contrib/openlayers/OpenLayers.js')}" type="text/javascript"></script>
    <script src="${request.static_url('eco:contrib/geoext/lib/GeoExt.js')}" type="text/javascript"></script>
    <script type="text/javascript" src="${request.static_url('eco:static/js/general_obj.js')}"></script>
    <script type="text/javascript" src="${request.static_url('eco:static/js/taxontree.js')}"></script>
    <script type="text/javascript" src="${request.static_url('eco:static/js/formwindow.js')}"></script>
    <script type="text/javascript" src="${request.static_url('eco:static/js/fields.js')}"></script>
    ##    <%include file="forms.js.mako" />

    <script type="text/javascript" src="${request.static_url('eco:static/js/annlist.js')}"></script>
    <script type="text/javascript" src="${request.static_url('eco:static/js/create_map.js')}"></script>
    ##    <%include file="app.js.mak" />

    <script>
        require(["dojox/data/QueryReadStore", "dojo/dom", "dojo/parser", "dojo/store/JsonRest",
            "dijit/layout/BorderContainer", "dijit/layout/ContentPane",
            "dijit/Dialog", "dijit/form/TextBox", "dijit/form/Button",
            "dijit/form/ValidationTextBox",
            "dojo/domReady!", "ugrabio/loader", "ugrabio/taxonSearcher", "ugrabio/taxonTree"],
                function () { });
    </script>
</head>
<body class="claro loading">
<div class="loader">
    <p>Инициализация ГИС...</p>
</div>
<div id="appLayout" class="demoLayout" data-dojo-type="dijit.layout.BorderContainer"
     data-dojo-props="design: 'headline'">
    <div class="centerPanel" data-dojo-type="dijit.layout.ContentPane"
         data-dojo-props="region: 'center', title: 'Group 1'">
        <div id="map">
        </div>
    </div>
    <div class="edgePanel" data-dojo-type="dijit.layout.ContentPane" data-dojo-props="region: 'top'">
        <div data-dojo-type="dojox.data.QueryReadStore"
             data-dojo-props="url:'/taxon/filter'"
             data-dojo-id="taxonStore"></div>
        <input id="search"/>
        <div class="user-data">
            <button id="loginButton" data-dojo-type="dijit/form/Button" type="button" onClick="loginDialog.show();">
                Вход
            </button>
        </div>
    </div>
    <div id="leftCol" class="edgePanel" data-dojo-type="dijit.layout.ContentPane"
         data-dojo-props="region: 'left', splitter: true">
    </div>
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
</body>
</html>