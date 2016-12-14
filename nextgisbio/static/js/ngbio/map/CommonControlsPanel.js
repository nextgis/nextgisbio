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


            var uploadPolygonControl = new OpenLayers.Control.UploadPolygon({
                cardsLayer: this._cardsLayer
            });
            this._map.addControl(uploadPolygonControl);
            // uploadPolygonControl.activate();

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
