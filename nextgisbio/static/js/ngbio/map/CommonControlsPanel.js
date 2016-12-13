define([
    'dojo/_base/declare',
    './UploadPolygonControl',
    'xstyle/css!./CommonControlsPanel/CommonControlsPanel.css'
], function (declare, UploadPolygonControl) {

    return declare(null, {
        constructor: function (map, cardsLayer) {
            this._map = map;
            this._cardsLayer = cardsLayer;
            this._init();
            if (window.File && window.FileReader && window.FileList && window.Blob) {

            } else {
                console.log('FileReader API is not supported.');
            }
        },

        _init: function () {
            this._polygonLayer = new OpenLayers.Layer.Vector("ngbio.polygon.cards_count");
            this._map.addLayer(this._polygonLayer);

            // var draw = new OpenLayers.Control.DrawFeature(this._polygonLayer, OpenLayers.Handler.Polygon);
            // this._map.addControl(draw);
            // draw.activate();

            var uploadPolygonControl = new OpenLayers.Control.UploadPolygon({
                polygonLayer: this._polygonLayer,
                cardsLayer: this._cardsLayer
            });
            this._map.addControl(uploadPolygonControl);
            uploadPolygonControl.activate();

            var panel = new OpenLayers.Control.Panel({
                defaultControl: uploadPolygonControl,
                createControlMarkup: function (control) {
                    if (control.getHtml) {
                        return control.getHtml();
                    }
                }
            });
            panel.addControls([
                uploadPolygonControl
            ]);
            this._map.addControl(panel);
        }
    });
});
