define([
    'dojo/_base/declare',
    'dojo/_base/window',
    'dojo/_base/lang',
    'dojo/dom-construct',
    'dojo/ready',
    'dojo/topic',
    'dojo/query',
    'dojo/dom-attr',
    'dojo/on',
    'dojo/aspect',
    'dojo/request/xhr',
    'dojo/store/Memory',
    'dgrid/OnDemandGrid',
    'dgrid/extensions/ColumnHider',
    'ngbio/Dialog',
    'ngbio/Filter',
    'ngbio/WmsLayers',
    './map/CommonControlsPanel',
    'dojo/domReady!'
], function (declare, win, lang, domConstruct, ready, topic, query, domAttr, on, aspect, xhr, Memory, OnDemandGrid,
             ColumnHider, Dialog, Filter, WmsLayers, CommonControlsPanel) {
    var map = declare('ngbio/Map', [], {
        constructor: function () {
            var taxon_nodes = [],
                defaultPointStyle = new OpenLayers.Style(
                    {
                        pointRadius: '${radius}',
                        fillColor: '#cc4444',
                        label: "${label}",
                        fillOpacity: 0.8,
                        strokeColor: '#000',
                        strokeWidth: 2,
                        strokeOpacity: 0.8
                    },
                    {
                        context: {
                            radius: function (f) {
                                if (f.attributes) {
                                    return 20 - 256 / (f.attributes.count + 15);
                                }
                                return 10;
                            },
                            label: function (f) {
                                var c = f.attributes.count;
                                return (c > 1) ? c : '';
                            }
                        }
                    }),
                defaultPolyStyle = new OpenLayers.Style({
                    fillColor: '#44cc44',
                    fillOpacity: 0.2,
                    strokeColor: '#000',
                    strokeWidth: 1,
                    strokeOpacity: 0.5
                }),
                defaultArealStyle = new OpenLayers.Style({
                    fillColor: '#4444cc',
                    fillOpacity: 0.2,
                    strokeColor: '#000',
                    strokeWidth: 1,
                    strokeOpacity: 0.5
                }),
                ooptStyle = new OpenLayers.StyleMap({
                    fillOpacity: 0,
                    strokeColor: '#000000',
                    strokeWidth: 1,
                    strokeOpacity: 0.5
                }),
                selectedStyle = new OpenLayers.Style({
                    fillColor: '#ffccaa'
                });


            // Создает карту и настраивает слои/отбражение

            var epsg4326 = new OpenLayers.Projection("EPSG:4326"),
                epsg3857 = new OpenLayers.Projection("EPSG:3857"),
                extent = new OpenLayers.Bounds(6353768, 7927909, 9587360, 9811317),
                cent_coords = {"lat": 8869000, "lon": 7970000, "zoom": 5},
                osm = new OpenLayers.Layer.OSM("OpenSteetMap"),
                gsat = new OpenLayers.Layer.Google("Google-HYBRID", {
                    type: google.maps.MapTypeId.HYBRID,
                    numZoomLevels: 20
                }),
                oopt = new OpenLayers.Layer.Vector("ООПТ", {
                    projection: epsg3857,
                    strategies: [new OpenLayers.Strategy.Fixed()],
                    protocol: new OpenLayers.Protocol.HTTP({
                        url: application_root + '/static/geojson/oopt.geojson',
                        format: new OpenLayers.Format.GeoJSON()
                    }),
                    styleMap: ooptStyle,
                    visibility: false
                }),
                clusterStrategy = new OpenLayers.Strategy.Cluster({distance: 15});

            var cardsLayer = new OpenLayers.Layer.Vector('Карточки наблюдений', {
                projection: epsg4326,
                strategies: [
                    new OpenLayers.Strategy.Fixed(),
                    clusterStrategy
                ],
                protocol: new OpenLayers.Protocol.HTTP({
                    url: application_root + '/points_text/?nodes=' + taxon_nodes + '&' + Filter.getAsQueryString(),
                    format: new OpenLayers.Format.Text()
                }),
                styleMap: new OpenLayers.StyleMap({
                    'default': defaultPointStyle,
                    'select': selectedStyle
                })
            });

            var arealLayer = new OpenLayers.Layer.Vector('Контурный ареал вида', {
                projection: epsg3857,
                strategies: [new OpenLayers.Strategy.Fixed()],
                protocol: new OpenLayers.Protocol.HTTP({
                    url: application_root + '/areal_text/?nodes=' + taxon_nodes,
                    format: new OpenLayers.Format.GeoJSON()
                }),
                styleMap: new OpenLayers.StyleMap({'default': defaultArealStyle, 'select': selectedStyle}),
                visibility: false
            });

            var squareLayer = new OpenLayers.Layer.Vector("Квадраты", {
                projection: epsg3857,
                strategies: [new OpenLayers.Strategy.Fixed()],
                protocol: new OpenLayers.Protocol.HTTP({
                    url: application_root + '/squares_text/',
                    format: new OpenLayers.Format.GeoJSON()
                }),
                styleMap: new OpenLayers.StyleMap({'default': defaultPolyStyle, 'select': selectedStyle}),
                visibility: false
            });

            var wms = WmsLayers;

            var options = {
                projection: epsg3857,
                maxExtent: extent,
                layers: [osm, gsat, wms.ooptLayer, wms.tracksLayer, squareLayer, arealLayer, cardsLayer]
                // restrictedExtent: extent,
                // layers: [osm, gsat, oopt, squareLayer, arealLayer, tracksLayer, ooptLayer, cardsLayer]
                // layers: [osm, oopt, squareLayer, arealLayer, cardsLayer]
            };

            var map = new OpenLayers.Map('map', options);

            map.setCenter(new OpenLayers.LonLat(cent_coords.lon, cent_coords.lat), cent_coords.zoom);

            var current_card_popup, current_card_feature, show_card_popup;

            show_card_popup = function (f) {
                if (current_card_feature == f) {
                    return; // не показывать заново подсказку для текущего элемента
                }
                current_card_feature = f;
                var features = f.cluster;
                features.sort(
                    function (a, b) {
                        if (a.attributes.name < b.attributes.name) return -1;
                        if (a.attributes.name > b.attributes.name) return 1;
                        if (a.attributes.id > b.attributes.id) return 1;
                        if (a.attributes.id < b.attributes.id) return -1;
                        return 0;
                    }
                );
                var refs = [];
                for (var i = 0; i < features.length; i++) {
                    var attributes = features[i].attributes,
                        cardId = attributes.card_id,
                        specId = attributes.spec_id,
                        name = attributes.name;
                    var ref = '<a href="javascript:void(0)" data-card-id="' + cardId + '" data-spec-id="' + specId + '">' + name + '</a>';
                    refs.push(ref);
                }
                refs = refs.join('<br/>');

                current_card_popup = new OpenLayers.Popup.FramedCloud(
                    "featurePopup",
                    f.geometry.getBounds().getCenterLonLat(),
                    new OpenLayers.Size(0, 0),
                    "<b>Наблюдения</b><br/>" + refs,
                    null, true, null);
                current_card_popup.minSize = new OpenLayers.Size(100, 100);
                current_card_popup.maxSize = new OpenLayers.Size(500, 300);

                f.popup = current_card_popup;
                current_card_popup.feature = f;
                map.addPopup(current_card_popup, true);

                var links = query('a', current_card_popup.contentDiv);
                on(links, 'click', function () {
                    var cardId = domAttr.get(this, 'data-card-id'),
                        specId = domAttr.get(this, 'data-spec-id'),
                        name = this.innerText || this.textContent;

                    xhr.get(application_root + '/taxon/type/' + specId, {handleAs: 'json'}).then(
                        function (kingdoms) {
                            var kingdom;
                            for (kingdom in kingdoms) {
                                if (kingdoms.hasOwnProperty(kingdom)) {
                                    if (kingdoms[kingdom] === true) {
                                        break;
                                    }
                                }
                            }
                            kingdom = kingdom.charAt(0).toUpperCase() + kingdom.slice(1);

                            xhr.get(application_root + '/card/' + cardId, {handleAs: 'json'}).then(
                                function (data) {
                                    var card = data.data,
                                        dialogSettings = data.editable ? {_dialog: {submit: true}} : {};
                                    topic.publish('open/form', 'card', 'card' + kingdom, 'Карточка № ' + card.id, 'card', card, dialogSettings);
                                });
                        },
                        function (error) {
                            alert('Извините, произошла ошибка, попробуйте еще раз.');
                        }
                    );
                });
            };

            var hide_card_popup = function (f) {
                map.removePopup(current_card_popup);
                current_card_popup = null;
                current_card_feature = null;
            };

            var current_square_popup, current_square_feature;
            var show_square_popup = function (f) {
                if (current_square_feature == f) {
                    return; // не показывать заново подсказку для текущего элемента
                }

                var request = OpenLayers.Request.GET({
                    url: application_root + '/square/' + f.data.id,
                    headers: {'Accept': 'application/json'},
                    success: function (e) {
                        current_square_feature = f;
                        header = 'Ключевые участки квадрата № ' + f.data.id;

                        doc = e.responseText;
                        parser = new OpenLayers.Format.JSON();
                        doc = parser.read(doc);
                        var descr = []
                        for (var i = 0; i < doc.key_areas.length; i++) {
                            var id = doc.key_areas[i].id,
                                name = doc.key_areas[i].name;
                            var ref = '<a href="javascript:void(0)" data-id="' + id + '" >' + name + '</a>';
                            descr.push(ref);
                        }
                        descr = descr.join('<br/>');

                        current_square_popup = new OpenLayers.Popup.FramedCloud(
                            "featurePopup",
                            f.geometry.getBounds().getCenterLonLat(),
                            new OpenLayers.Size(0, 0),
                            "<b>" + header + "</b><br/>" + descr,
                            null, true, null);
                        current_square_popup.minSize = new OpenLayers.Size(100, 100);
                        current_square_popup.maxSize = new OpenLayers.Size(300, 300);

                        f.popup = current_square_popup;
                        current_square_popup.feature = f;
                        map.addPopup(current_square_popup, true);

                        var links = query('a', current_square_popup.contentDiv);
                        on(links, 'click', function () {
                            var keyAreaId = domAttr.get(this, 'data-id'),
                                keyName = this.innerText || this.textContent;
                            xhr.get(application_root + '/key_area/' + keyAreaId + '/ann', {
                                handleAs: 'json'
                            }).then(function (data) {
                                var store = new Memory({data: data.data});

                                var grid = new declare([OnDemandGrid, ColumnHider])({
                                    columns: {
                                        name: {label: "Вид", unhidable: true},
                                        id: {label: 'id', hidden: true},
                                        species: {label: 'species', hidden: true}
                                    },
                                    store: store
                                });

                                var dialog = new Dialog({
                                    title: 'Списки ключевого участка &laquo;' + keyName + '&raquo;',
                                    content: grid,
                                    'class': 'keyAreaDialog'
                                });
                                dialog.show();

                                var closeHandle = topic.subscribe('/annotation/list/update', function () {
                                    xhr.get(application_root + '/key_area/' + keyAreaId + '/ann', {
                                        handleAs: 'json'
                                    }).then(function (data) {
                                        store = new Memory({data: data.data});
                                        grid.store = store;
                                        grid.refresh();
                                    });
                                });

                                aspect.after(dialog._getDialog(), 'close', lang.hitch(this, function () {
                                    closeHandle.remove();
                                }));

                                grid.startup();

                                grid.on("div.dgrid-row:click", function (e) {
                                    var idAnnotationField = query('td.field-id', this)[0],
                                        idAnnotation = idAnnotationField.innerText || idAnnotationField.textContent,
                                        idSpecieField = query('td.field-species', this)[0],
                                        idSpecie = idSpecieField.innerText || idSpecieField.textContent;
                                    xhr.get(application_root + '/taxon/type/' + idSpecie, {handleAs: 'json'}).then(
                                        function (kingdoms) {
                                            var kingdom;
                                            for (kingdom in kingdoms) {
                                                if (kingdoms.hasOwnProperty(kingdom)) {
                                                    if (kingdoms[kingdom] === true) {
                                                        break;
                                                    }
                                                }
                                            }
                                            kingdom = kingdom.charAt(0).toUpperCase() + kingdom.slice(1);

                                            xhr.get(application_root + '/annotation/' + idAnnotation, {handleAs: 'json'}).then(
                                                function (data) {
                                                    var annotation = data.data,
                                                        dialogSettings = data.editable ? {_dialog: {submit: true}} : null;
                                                    topic.publish('open/form', 'an', 'an' + kingdom, 'Аннотированный список № ' + annotation.id, 'annotation', annotation, dialogSettings);
                                                });
                                        },
                                        function (error) {
                                            alert('Извините, произошла ошибка, попробуйте еще раз.');
                                        }
                                    );
                                });

                            }, function (error) {
                                alert('Извините, произошла ошибка, попробуйте еще раз.');
                            });
                        });
                    }
                });
            };

            var hide_square_popup = function (f) {
                if (current_square_popup) {
                    map.removePopup(current_square_popup);
                    current_square_popup = null;
                    current_square_feature = null;
                }
            };

            var current_ann_popup, current_ann_feature;
            var show_ann_popup = function (f) {
                if (current_ann_feature == f) {
                    return; // не показывать заново подсказку для текущего элемента
                }

                var request = OpenLayers.Request.GET({
                    url: application_root + '/anns_text/square/' + f.data.id + '?nodes=' + taxon_nodes,
                    headers: {'Accept': 'application/json'},
                    success: function (e) {
                        current_ann_feature = f;
                        header = 'Аннотированные списки квадрата № ' + f.data.id;

                        var doc = e.responseText;
                        parser = new OpenLayers.Format.JSON();
                        doc = parser.read(doc);
                        var data = doc.data;
                        data.sort(
                            function (a, b) {
                                if (a.name < b.name) return -1;
                                if (a.name > b.name) return 1;
                                return 0;
                            }
                        );

                        var descr = [];
                        for (var i = 0; i < data.length; i++) {
                            var annotationId = data[i].ann_id,
                                specieId = data[i].spec_id,
                                name = data[i].name,
                                ref = '<a href="javascript:void(0)" data-ann-id="' + annotationId + '" data-spec-id="' + specieId + '" >' + name + '</a>';
                            descr.push(ref);
                        }
                        descr = descr.join('<br/>');

                        current_ann_popup = new OpenLayers.Popup.FramedCloud(
                            "featurePopup",
                            f.geometry.getBounds().getCenterLonLat(),
                            new OpenLayers.Size(0, 0),
                            "<b>" + header + "</b><br/>" + descr,
                            null, true, null);
                        current_ann_popup.minSize = new OpenLayers.Size(100, 100);
                        current_ann_popup.maxSize = new OpenLayers.Size(300, 300);

                        f.popup = current_ann_popup;
                        current_ann_popup.feature = f;
                        map.addPopup(current_ann_popup, true);

                        var links = query('a', current_ann_popup.contentDiv);
                        on(links, 'click', function () {
                            var idAnnotation = domAttr.get(this, 'data-ann-id'),
                                idSpecie = domAttr.get(this, 'data-spec-id');
                            xhr.get(application_root + '/taxon/type/' + idSpecie, {handleAs: 'json'}).then(
                                function (kingdoms) {
                                    var kingdom;
                                    for (kingdom in kingdoms) {
                                        if (kingdoms.hasOwnProperty(kingdom)) {
                                            if (kingdoms[kingdom] === true) {
                                                break;
                                            }
                                        }
                                    }
                                    kingdom = kingdom.charAt(0).toUpperCase() + kingdom.slice(1);

                                    xhr.get(application_root + '/annotation/' + idAnnotation, {handleAs: 'json'}).then(
                                        function (data) {
                                            var annotation = data.data,
                                                dialogSettings = data.editable ? {_dialog: {submit: true}} : null;
                                            topic.publish('open/form', 'an', 'an' + kingdom, 'Аннотированный список № ' + annotation.id, 'annotation', annotation, dialogSettings);
                                        });
                                },
                                function (error) {
                                    alert('Извините, произошла ошибка, попробуйте еще раз.');
                                }
                            );
                        });
                    }
                });
            };

            var hide_ann_popup = function (f) {
                if (current_ann_popup) {
                    map.removePopup(current_ann_popup);
                    current_ann_popup = null;
                    current_ann_feature = null;
                }
            };

            var selecter = new OpenLayers.Control.SelectFeature(
                [cardsLayer, arealLayer, squareLayer], {multiple: false, toggle: true}
            );
            map.addControl(selecter);
            selecter.activate();

            topic.subscribe('taxon/selected/changed', function () {
                taxon_nodes = arguments[0];

                clusterStrategy.clearCache();
                cardsLayer.destroyFeatures();
                cardsLayer.refresh({
                    force: true,
                    url: application_root + '/points_text/?nodes=' + taxon_nodes + '&' + Filter.getAsQueryString()
                });

                arealLayer.destroyFeatures();
                arealLayer.refresh({
                    force: true,
                    url: application_root + '/areal_text/?nodes=' + taxon_nodes
                });
            });

            squareLayer.events.on({
                "featureselected": function (e) {
                    show_square_popup(e.feature)
                },
                "featureunselected": function (e) {
                    hide_square_popup(e.feature)
                }
            });
            cardsLayer.events.on({
                "featureselected": function (e) {
                    show_card_popup(e.feature)
                },
                "featureunselected": function (e) {
                    hide_card_popup(e.feature)
                },

                'visibilitychanged': function (e) {
                    cardsLayer.refresh({
                        force: true,
                        url: application_root + '/points_text/?nodes=' + taxon_nodes
                    });
                }
            });
            arealLayer.events.on({
                "featureselected": function (e) {
                    show_ann_popup(e.feature)
                },
                "featureunselected": function (e) {
                    hide_ann_popup(e.feature)
                },

                'visibilitychanged': function (e) {
                    arealLayer.refresh({
                        force: true,
                        url: application_root + '/areal_text/?nodes=' + taxon_nodes
                    });
                }
            });

            // Координаты
            map.addControl(
                new OpenLayers.Control.MousePosition({
                    separator: ', ',
                    numDigits: 4,
                    emptyString: '',
                    displayProjection: epsg4326
                })
            );

            map.addControl(
                new OpenLayers.Control.LayerSwitcher({
                    'ascending': false
                })
            );

            //~ map.events.register("mousemove", map, function(e) {
            //~ var position = this.events.getMousePosition(e);
            //~ OpenLayers.Util.getElement("coords").innerHTML = position;
            //~ });

            // NextGIS banner
            var div = document.createElement("div");
            div.style.position = "absolute";
            div.style.zIndex = "1100";
            div.style.right = "1px";
            div.style.top = "1px";
            div.innerHTML = '<a href="http://nextgis.ru" target="_blank"><img src="' + application_root + '/static/img/nextgis.png" alt="NextGIS: открытые геотехнологии" width="100" height="33" /></a>';
            map.viewPortDiv.appendChild(div);

            new CommonControlsPanel(map, cardsLayer);

            this._map = map;
            return this._map;
        },

        _coordinatesPickerData: {
            layer: null,
            dragControl: null,
            activeId: null
        },

        coordinatesPickerOn: function (id, callback, lat, lon) {
            if (this._coordinatesPickerData.dragControl && this._coordinatesPickerData.dragControl.active) {
                throw 'coordinatesPicker is busy!';
            }

            var latLon = null;
            if (!lat || !lon) {
                latLon = this._map.getCenter();
                callback(OpenLayers.Projection.transform(
                    {x: latLon.lon, y: latLon.lat},
                    new OpenLayers.Projection('EPSG:3857'),
                    new OpenLayers.Projection('EPSG:4326')));
            } else {
                latLon = new OpenLayers.LonLat(parseFloat(lat), parseFloat(lon));
                latLon = latLon.transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:3857'));
            }

            this._coordinatesPickerData.activeId = id;

            this._buildCoordinatesPickerData();
            this._createCoordinatePickerMarker(latLon);
            this._bindDragCallback(callback);
            this._coordinatesPickerData.dragControl.activate();
        },

        coordinatesPickerOff: function (id) {
            if (this._coordinatesPickerData.activeId == id) {
                this._coordinatesPickerData.layer.removeAllFeatures();
                this._coordinatesPickerData.dragControl.deactivate();
            }
        },

        _createCoordinatePickerMarker: function (latLon) {
            var markerStyle = {
                    externalGraphic: application_root + '/static/js/lib/openlayers/img/marker.png',
                    graphicWidth: 21,
                    graphicHeight: 25,
                    fillOpacity: 1
                },
                point = new OpenLayers.Geometry.Point(latLon.lon, latLon.lat),
                marker = new OpenLayers.Feature.Vector(point, null, markerStyle);

            this._coordinatesPickerData.layer.addFeatures([marker]);
            this._map.panTo(latLon);
        },

        _buildCoordinatesPickerData: function () {
            if (this._coordinatesPickerData.layer) return this._coordinatesPickerData;

            this._coordinatesPickerData.layer = new OpenLayers.Layer.Vector('_coordinatesPicker', {
                projection: new OpenLayers.Projection('EPSG:3857'),
                displayInLayerSwitcher: false
            });

            this._map.addLayer(this._coordinatesPickerData.layer);

            this._coordinatesPickerData.dragControl = new OpenLayers.Control.DragFeature(this._coordinatesPickerData.layer);
            this._map.addControl(this._coordinatesPickerData.dragControl);
        },

        _bindDragCallback: function (callback) {
            this._coordinatesPickerData.dragControl.onDrag =
                function (val) {
                    callback(OpenLayers.Projection.transform(
                        {x: val.geometry.x, y: val.geometry.y},
                        new OpenLayers.Projection('EPSG:3857'),
                        new OpenLayers.Projection('EPSG:4326')));
                };
        }
    });

    ready(function () {
        if (!window.ngbio.map) {
            window.ngbio.map = new map();
        }
    });

    if (window.ngbio.map) {
        return window.ngbio.map;
    } else {
        return null;
    }
});