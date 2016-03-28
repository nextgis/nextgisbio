<%
    import json
%>

<script type="text/javascript">
    var application_root = ${request.application_url | json.dumps, n};

    dojoConfig = {
        async: true,
        debug: true,
        ##            cacheBust: true,
        parseOnLoad: true,
        baseUrl: "${request.static_url('nextgisbio:static/js/')}",
        locale: "ru-ru",
        packages: [
            {name: 'dojo', location: 'lib/dojo-release-1.9.1/dojo'},
            {name: 'dijit', location: 'lib/dojo-release-1.9.1/dijit'},
            {name: 'dojox', location: 'lib/dojo-release-1.9.1/dojox'},
            {name: 'ngbio', location: 'ngbio'},
            {name: 'lib', location: 'lib'},
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