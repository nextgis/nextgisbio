<!DOCTYPE HTML>
<html lang="ru">

    <%
        from pyramid.security import has_permission, ACLAllowed
    %>

<head>
    <meta charset="utf-8">
    <title>${title}</title>

    <link rel="icon" type="image/ico" href="${request.static_url('nextgisbio:static/favicon.ico')}"/>

    <link rel="stylesheet"
          href="${request.static_url('nextgisbio:static/js/lib/dojo-release-1.9.1/dijit/themes/claro/claro.css')}"
          media="screen">

    <link rel="stylesheet"
          href="${request.static_url('nextgisbio:static/js/lib/dgrid/css/skins/claro.css')}"/>

    <link rel="stylesheet" type="text/css" href="${request.static_url('nextgisbio:static/css/main.css')}"
          media="screen">

    <%block name="css"></%block>
</head>
<body class="claro loading">
<div id="loader">
    <div class="wrapper">
        <img src="${request.static_url('nextgisbio:static/img/nextgisbio-logo.svg')}"/>

        <div id="LayersLoadingIndicator" class="meter" title="">
            <span id="loaderIndicator" style="width: 0;"></span>
        </div>
    </div>
</div>

<div id="appLayout" class="demoLayout" data-dojo-type="dijit.layout.BorderContainer"
     data-dojo-props="design: 'headline'">

    <div class="edgePanel" data-dojo-type="dijit.layout.ContentPane"
         data-dojo-props="region: 'top'"
         style="width: 100%; overflow:visible;">
        <%include file="../components/_button_back_maps.mako"/>
        <%include file="../components/_button_login.mako"/>
    </div>

    <div data-dojo-type="dijit/layout/ContentPane"
         data-dojo-props="region: 'center'"
         style="width: 100%;">
        <%block name="content"></%block>
    </div>
</div>
</body>

<script type="text/javascript">
    window.ngbio = {};
        %if is_auth:
            window.ngbio.is_auth = true;
        %endif
        %if is_admin:
            window.ngbio.mode = 'admin';
        %endif
</script>

    <%include file="../components/_dojo_config.mako"/>

<script type="text/javascript"
        src="${request.static_url('nextgisbio:static/js/lib/dojo-release-1.9.1/dojo/dojo.js')}"></script>
<script type="text/javascript" src="${request.static_url('nextgisbio:static/js/lib/jquery-1.11.2/jquery.js')}"></script>

<script src="https://maps.google.com/maps/api/js?sensor=false"></script>

<script src="${request.static_url('nextgisbio:static/js/lib/openlayers/OpenLayers.js')}"
        type="text/javascript"></script>

    <%block name='initJs'>
        <script>
            require(['ngbio/Forms', 'ngbio/Menu', 'ngbio/TaxonSearcher', 'ngbio/TaxonHomeTree',
                        'dojox/data/QueryReadStore', 'dojo/dom', 'dojo/parser', 'dojo/store/JsonRest',
                        'dijit/layout/BorderContainer', 'dijit/layout/ContentPane',
                        'dijit/Dialog', 'dijit/form/TextBox', 'dijit/form/Button',
                        'dijit/form/ValidationTextBox', 'dojo/topic', 'dojo/domReady!',
                        'ngbio/Loader', 'ngbio/Map', 'ngbio/Dialog', 'ngbio/DialogManager',
                        'ngbio/WindowManager', 'dojo/domReady!'],
                    function (Forms, Menu, TaxonSearcher, TaxonHomeTree) {

                    });
        </script>
    </%block>

    <%block name='js'></%block>

    <%include file="../components/_ngbio_loader.mako"></%include>

</html>