define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    './UploadFileDialog/UploadFileDialog'
], function (declare, array, lang, UploadFileDialog) {
    OpenLayers.Control.UploadPolygon = OpenLayers.Class(OpenLayers.Control, {
        type: OpenLayers.Control.TYPE_BUTTON,
        layer: null,
        callbacks: null,
        multi: false,

        featureAdded: function () {
        },

        initialize: function (layerData, options) {
            this.polygonLayer = layerData.polygonLayer;
            this.cardsLayer = layerData.cardsLayer;
            OpenLayers.Control.prototype.initialize.apply(this, [options]);
        },

        getHtml: function () {
            var $div = $('<div></div>');
            $div.addClass('olControlUploadPolygonItemActive');
            $div.attr('title', 'Загрузить полигон (GeoJSON)');
            return $div[0];
        },

        trigger: function () {
            if (this._popup) {
                this._popup.destroy();
                this._popup = null;
            }
            if (this.polygonLayer) {
                this.polygonLayer.removeAllFeatures();
            }

            var dialog = new UploadFileDialog({
                onSubmit: lang.hitch(this, function (file) {
                    var fileReader = new FileReader();

                    fileReader.onload = lang.hitch(this, function (e) {
                        var geoJsonContent = e.target.result;
                        this._handleGeoJson(geoJsonContent);
                    });

                    fileReader.readAsText(file);
                })
            });
            dialog.show();
        },

        _handleGeoJson: function (geoJsonString) {
            var geojson_format = new OpenLayers.Format.GeoJSON();
            var geoJson = JSON.parse(geoJsonString);
            this.polygonLayer.addFeatures(geojson_format.read(geoJson));
            this.polygonLayer.map.zoomToExtent(this.polygonLayer.getDataExtent());
            this._buildPopup();
        },

        _popup: null,
        _buildPopup: function () {
            var cardsCountInfo = this._getCardsCountInPolygonInfo();

            this._popup = new OpenLayers.Popup('UploadPolygonPopup',
                cardsCountInfo.polygonGeometry.getBounds().getCenterLonLat(),
                new OpenLayers.Size(100, 50),
                '<p>Карточек внутри полигона: <b>' + cardsCountInfo.cards + '</b></p>',
                true);

            this.polygonLayer.map.addPopup(this._popup);
        },

        _getCardsCountInPolygonInfo: function () {
            var cardsFeaturesInPolygon = 0,
                polygon = this.polygonLayer.features.length > 0 ? this.polygonLayer.features[0] : null,
                polygonGeometry;

            if (!polygon) return 0;
            polygonGeometry = polygon.geometry;

            array.forEach(this.cardsLayer.features, function (cardFeature) {
                if (cardFeature.cluster) {
                    array.forEach(cardFeature.cluster, function (feature) {
                        if (polygonGeometry.intersects(feature.geometry)) {
                            cardsFeaturesInPolygon++;
                        }
                    });
                } else {
                    if (polygonGeometry.intersects(cardFeature.geometry)) {
                        cardsFeaturesInPolygon++;
                    }
                }
            });

            return {
                cards: cardsFeaturesInPolygon,
                polygonGeometry: polygonGeometry
            };
        },

        CLASS_NAME: "OpenLayers.Control.UploadPolygon"
    });
});
