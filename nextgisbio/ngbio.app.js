var profile = (function () {
    return {
        basePath: './static',
        releaseDir: './js/release',
        releaseName: 'ngbio',
        action: 'release',
        layerOptimize: 'closure',
        optimize: 'closure',
        cssOptimize: 'comments',
        mini: true,
        stripConsole: 'all',
        selectorEngine: 'acme',

        staticHasFeatures: {
            'dojo-trace-api': 0,
            'dojo-log-api': 0,
            'dojo-publish-privates': 0,
            'dojo-sync-loader': 0,
            'dojo-xhr-factory': 0,
            'dojo-test-sniff': 0
        },

        packages: [
            {name: 'dojo', location: '../../bower_components/dojo'}, {
                name: 'dijit',
                location: '../../bower_components/dijit'
            }, {
                name: 'dojox',
                location: '../../bower_components/dojox'
            }, {
                name: 'ngbio',
                location: 'js/ngbio'
            }, {
                name: 'dgrid',
                location: 'js/lib/dgrid'
            }, {
                name: 'put-selector',
                location: 'js/lib/put-selector'
            }, {
                name: 'xstyle',
                location: 'js/lib/xstyle'
            }, {
                name: 'mustache',
                location: 'js/lib/mustache'
            },
            {
                name: 'dropzone',
                location: 'js/lib/dropzone'
            }, {
                name: 'jstree',
                location: 'js/lib/jstree-3.0.9'
            }, {
                name: 'jquery',
                location: 'js/lib/jquery-1.11.2'
            }],

        layers: {
            'ngbio/app': {
                include: ['ngbio/boot'],
                customBase: false,
                boot: false,
                includeLocales: ['ru-ru']
            }
        }
    };
})();