define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/Deferred',
    'dojox/widget/Standby',
    './UploadFileDialog/UploadFileDialog',
    'dojo/text!./UploadPolygonControlPopup.mustache',
    'mustache/mustache'
], function (declare, array, lang, Deferred, Standby, UploadFileDialog, popupTemplate, mustache) {
    OpenLayers.Control.UploadPolygon = OpenLayers.Class(OpenLayers.Control, {
        type: OpenLayers.Control.TYPE_BUTTON,
        layer: null,
        callbacks: null,
        multi: false,

        polygonLayer: null,
        standby: null,

        activate: function () {
            this.polygonLayer = new OpenLayers.Layer.Vector("ngbio.polygon.cards_count");
            this.map.addLayer(this.polygonLayer);

            this.standby = new Standby({target: "appLayout"});
            document.body.appendChild(this.standby.domNode);
            this.standby.startup();

            return (OpenLayers.Control.prototype.activate.apply(this, arguments));
        },

        initialize: function (layerData, options) {
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
            this.standby.show();

            this._getCardsCountInPolygonInfo().then(lang.hitch(this, function (cardsCountInfo) {
                this._popup = new OpenLayers.Popup('UploadPolygonPopup',
                    cardsCountInfo.polygonGeometry.getBounds().getCenterLonLat(),
                    new OpenLayers.Size(100, 50),
                    mustache.render(popupTemplate, cardsCountInfo),
                    true,
                    lang.hitch(this, function () {
                        this.polygonLayer.removeAllFeatures();
                        this._popup.destroy();
                        this._popup = null;
                    })
                );
                this.polygonLayer.map.addPopup(this._popup);
                $('#calculateCards').click(lang.hitch(this, function () {
                    this.standby.show();
                    this._getCardsCountInPolygonInfo().then(lang.hitch(this, function (cardsCountInfo) {
                        $('#UploadPolygonPopup span.cardsCount').html(cardsCountInfo.cards);
                        this.standby.hide();
                    }));
                }));
                this.standby.hide();
            }));
        },

        _getCardsCountInPolygonInfo: function () {
            var deferred = new Deferred(),
                cardsFeaturesInPolygon = 0,
                polygon = this.polygonLayer.features.length > 0 ? this.polygonLayer.features[0] : null,
                polygonGeometry;

            if (!polygon) return 0;
            polygonGeometry = polygon.geometry;
            polygonGeometry._countPoints = polygonGeometry.components[0].components.length;

            setTimeout(lang.hitch(this, function () {
                array.forEach(this.cardsLayer.features, function (cardFeature) {
                    if (cardFeature.cluster) {
                        array.forEach(cardFeature.cluster, function (feature) {
                            if (this.inside(feature.geometry, polygonGeometry)) {
                                cardsFeaturesInPolygon++;
                            }
                        }, this);
                    } else {
                        if (this.inside(cardFeature.geometry, polygonGeometry)) {
                            cardsFeaturesInPolygon++;
                        }
                    }
                }, this);
                deferred.resolve({
                    cards: cardsFeaturesInPolygon,
                    polygonGeometry: polygonGeometry
                });
            }), 1000);

            return deferred.promise;
        },

        inside: function (point, polygonGeometry) {
            var polygonCountPoints = polygonGeometry._countPoints,
                polygonPoints = polygonGeometry.components[0].components,
                x = point.x,
                y = point.y,
                inside = false;

            for (var i = 0, j = polygonCountPoints - 1; i < polygonCountPoints; j = i++) {
                var xi = polygonPoints[i].x, yi = polygonPoints[i].y;
                var xj = polygonPoints[j].x, yj = polygonPoints[j].y;

                var intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }

            return inside;
        },

        CLASS_NAME: "OpenLayers.Control.UploadPolygon"
    });
});
