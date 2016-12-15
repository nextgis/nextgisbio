define([
    'dojo/_base/declare'
], function (declare) {
    return {
        tracksLayer: new OpenLayers.Layer.WMS(
            "Маршруты экспедиций",
            "http://demoby.nextgis.com/api/resource/19/wms", {
                layers: 'tracks',
                transparent: true
            }, {
                isBaseLayer: false,
                visibility: false
            }),
        ooptLayer: new OpenLayers.Layer.WMS("ООПТ",
            "http://demoby.nextgis.com/api/resource/19/wms", {
                layers: 'oopt',
                transparent: true
            }, {
                isBaseLayer: false,
                visibility: false
            })
    };
});
