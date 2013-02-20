<html xmlns="http://www.w3.org/1999/xhtml">
<%
    import json
    from pyramid.security import has_permission, ACLAllowed
%>

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>
    <title>ГИС по объектам животного и растительного мира Ханты-Мансийского автономного округа</title>

    <script type="text/javascript">
        var application_root = ${request.application_url | json.dumps, n};
    </script>

    <script src="${request.static_url('eco:contrib/extjs/adapter/ext/ext-base.js')}" type="text/javascript"></script>
    <script src="${request.static_url('eco:contrib/extjs/ext-all.js')}"  type="text/javascript"></script>
    <link rel="stylesheet" type="text/css" href="${request.static_url('eco:contrib/extjs/resources/css/ext-all.css')}" />


    <script src="http://maps.google.com/maps/api/js?v=3.6&amp;sensor=false"></script>


    <script src="${request.static_url('eco:contrib/openlayers/OpenLayers.js')}" type="text/javascript"></script>
    <script src="${request.static_url('eco:contrib/geoext/lib/GeoExt.js')}" type="text/javascript"></script>
    <link rel="stylesheet" type="text/css" href="${request.static_url('eco:contrib/geoext/resources/css/geoext-all-debug.css')}"></link>
    <link rel="stylesheet" type="text/css" href="${request.static_url('eco:static/css/main.css')}"/>
    
    <script type="text/javascript" src="${request.static_url('eco:static/js/general_obj.js')}"></script>
    <script type="text/javascript" src="${request.static_url('eco:static/js/taxontree.js')}"></script>
    
    <script type="text/javascript" src="${request.static_url('eco:static/js/formwindow.js')}"></script>
    <script type="text/javascript" src="${request.static_url('eco:static/js/fields.js')}"></script>
    
    <%include file="forms.js.mak" />
    
    
    <script type="text/javascript" src="${request.static_url('eco:static/js/annlist.js')}"></script>
    
    <script type="text/javascript" src="${request.static_url('eco:static/js/create_map.js')}"></script>
    
    <%include file="app.js.mak" />
</head>
<body>

</body>
</html>





