// Стили
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
            radius: function(f) {
                if (f.attributes) {
                    return 20 - 256 / (f.attributes.count + 15);
                }
                return 10;
            },
            label: function(f) {
                var c = f.attributes.count;
                return (c > 1) ? c : '';
            }
    }
});
defaultPolyStyle = new OpenLayers.Style({
    fillColor: '#44cc44',
    fillOpacity: 0.2,
    strokeColor: '#000',
    strokeWidth: 1,
    strokeOpacity: 0.5
});
defaultArealStyle = new OpenLayers.Style({
    fillColor: '#4444cc',
    fillOpacity: 0.2,
    strokeColor: '#000',
    strokeWidth: 1,
    strokeOpacity: 0.5
});
ooptStyle  = new OpenLayers.StyleMap({
    fillOpacity: 0, 
    strokeColor: '#000000', 
    strokeWidth: 1, 
    strokeOpacity: 0.5
})

selectedStyle = new OpenLayers.Style({
    fillColor: '#ffccaa'
});



function createMap(){
    // Создает карту и настраивает слои/отбражение

    var epsg4326 = new OpenLayers.Projection("EPSG:4326"),
        epsg3857 = new OpenLayers.Projection("EPSG:3857"),
        extent = new OpenLayers.Bounds(6353768, 7927909, 9587360, 9811317),
        cent_coords = {"lat": 8869000, "lon": 7970000, "zoom": 5},
        osm = new OpenLayers.Layer.OSM("OpenSteetMap"),
        gsat = new OpenLayers.Layer.Google("Google-HYBRID", {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}),
        oopt = new OpenLayers.Layer.Vector("ООПТ", {
            projection: epsg3857,
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.HTTP({
                url: application_root + '/static/geojson/oopt.geojson',
                format: new OpenLayers.Format.GeoJSON()
            }),
            styleMap: ooptStyle
        }),
        clusterStrategy = new OpenLayers.Strategy.Cluster({distance: 15});

    var cardsLayer = new OpenLayers.Layer.Vector('Карточки наблюдений', {
        projection: epsg4326,
        strategies: [
            new OpenLayers.Strategy.Fixed(),
            clusterStrategy
        ],
        protocol: new OpenLayers.Protocol.HTTP({
            url: application_root + '/points_text/?nodes='+taxon_nodes,
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
            url: application_root + '/areal_text/?nodes='+taxon_nodes,
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

    var options = {
        projection: epsg3857,
        maxExtent: extent,
        restrictedExtent: extent,
        center: new OpenLayers.LonLat(cent_coords.lon, cent_coords.lat),
        startZoom: cent_coords.zoom,
        layers: [osm, gsat, oopt, squareLayer, arealLayer, cardsLayer]
    };

    var map = new OpenLayers.Map('map', options);


    var current_card_popup, current_card_feature, show_card_popup;

    show_card_popup = function (f) {
        if (current_card_feature == f) {
            return; // не показывать заново подсказку для текущего элемента
        }
        current_card_feature = f;
        var features = f.cluster;
        features.sort(
            function(a,b){
                if(a.attributes.name<b.attributes.name) return -1;
                if(a.attributes.name>b.attributes.name) return 1;
                if(a.attributes.id>b.attributes.id) return 1;
                if(a.attributes.id<b.attributes.id) return -1;
                return 0;
            }
        );
        var descr = [];
        for (var i = 0; i < features.length; i++) {
                descr.push(features[i].attributes.description);
            };
        descr = descr.join('<br/>');
        current_card_popup = new OpenLayers.Popup.FramedCloud(
            "featurePopup",
            f.geometry.getBounds().getCenterLonLat(),
            new OpenLayers.Size(0,0),
            "<b>Наблюдения</b><br/>" + descr,
            null, true, null);
        current_card_popup.maxSize = new OpenLayers.Size(500,300);

        f.popup = current_card_popup;
        current_card_popup.feature = f;
        map.addPopup(current_card_popup, true);
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
        };

        var request = OpenLayers.Request.GET({
            url: application_root + '/square/' + f.data.id, 
            headers: {'Accept':'application/json'}, 
            success: function(e) {
                current_square_feature = f;
                header = 'Ключевые участки квадрата № ' + f.data.id;
                
                doc = e.responseText;
                parser = new OpenLayers.Format.JSON();
                doc = parser.read(doc);
                var descr = []
                for (var i = 0; i < doc.key_areas.length; i++) {
                    var url = application_root + '/key_area/'+doc.key_areas[i].id +'/ann';
                    var name = doc.key_areas[i].name;
                    var ref = "<a href='#' onClick='showAnnList(\""+url+"\", \""+name+"\");'" + ">"+name+"</a>";
                    descr.push(ref);
                };
                descr = descr.join('<br/>');
                
                current_square_popup = new OpenLayers.Popup.FramedCloud(
                    "featurePopup",
                    f.geometry.getBounds().getCenterLonLat(),
                    new OpenLayers.Size(0,0),
                    "<b>"+ header+ "</b><br/>" + descr,
                    null, true, null);
                current_square_popup.maxSize = new OpenLayers.Size(300,300);

                f.popup = current_square_popup;
                current_square_popup.feature = f;
                map.addPopup(current_square_popup, true);
            }
        });
    };

    var hide_square_popup = function (f) {
        if (current_square_popup) {
            map.removePopup(current_square_popup);
            current_square_popup = null;
            current_square_feature = null;
        };
    };

    var current_ann_popup, current_ann_feature;
    var show_ann_popup = function (f) {
        if (current_ann_feature == f) {
            return; // не показывать заново подсказку для текущего элемента
        };

        var request = OpenLayers.Request.GET({
            url: application_root + '/anns_text/square/' + f.data.id+'?nodes='+taxon_nodes, 
            headers: {'Accept':'application/json'}, 
            success: function(e) {
                current_ann_feature = f;
                header = 'Аннотированные списки квадрата № ' + f.data.id;
                
                var doc = e.responseText;
                parser = new OpenLayers.Format.JSON();
                doc = parser.read(doc);
                var data = doc.data;
                data.sort(
                    function(a,b){
                        if(a.name<b.name) return -1;
                        if(a.name>b.name) return 1;
                        return 0;
                    }
                );
                
                var descr = [];
                for (var i = 0; i < data.length; i++) {
                    var title = 'Аннотация № ' + data[i].ann_id;
                    var fields = "annFieldlistByTaxonId("+data[i].spec_id+")";
                    var recordID = data[i].ann_id;
                    var name = data[i].name;
                    var baseURL = application_root + '/annotation/';
                    var onclick = "new formWindow({form: new tableRowForm({baseURL: \"" + baseURL + "\", recordID: " + recordID + ", fields: "+ fields+ "}), title: \"" + title + "\"}).show();";
                    var ref = "<a href='#' onClick='"+ onclick +"'" + ">"+name+"</a>";
                    descr.push(ref);
                };
                descr = descr.join('<br/>');
                
                current_ann_popup = new OpenLayers.Popup.FramedCloud(
                    "featurePopup",
                    f.geometry.getBounds().getCenterLonLat(),
                    new OpenLayers.Size(0,0),
                    "<b>"+ header+ "</b><br/>" + descr,
                    null, true, null);
                current_ann_popup.maxSize = new OpenLayers.Size(300,300);

                f.popup = current_ann_popup;
                current_ann_popup.feature = f;
                map.addPopup(current_ann_popup, true);
            }
        });
    };

    var hide_ann_popup = function (f) {
        if (current_ann_popup) {
            map.removePopup(current_ann_popup);
            current_ann_popup = null;
            current_ann_feature = null;
        };
    };
    
    var selecter = new OpenLayers.Control.SelectFeature(
        [cardsLayer, arealLayer, squareLayer], {multiple: false, toggle: true}
    );
    map.addControl(selecter);
    selecter.activate();
    
    taxonEvents.on('taxonCheckedChange', function(nodes) {
        taxon_nodes = nodes;
        
        clusterStrategy.clearCache();
        cardsLayer.destroyFeatures();
        cardsLayer.refresh({
            force:true,
            url: application_root + '/points_text/?nodes='+taxon_nodes
        });
        
        arealLayer.destroyFeatures();
        arealLayer.refresh({
            force:true,
            url: application_root + '/areal_text/?nodes='+taxon_nodes
        });
    });
    
    squareLayer.events.on({
        "featureselected": function (e) { show_square_popup(e.feature)},
        "featureunselected": function (e) { hide_square_popup(e.feature)}
    });
    cardsLayer.events.on({
        "featureselected": function (e) { show_card_popup(e.feature)},
        "featureunselected": function (e) { hide_card_popup(e.feature)},
        
        'visibilitychanged': function(e) {
            cardsLayer.refresh({
                force:true,
                url: application_root + '/points_text/?nodes='+taxon_nodes
            });
        }
    });
    arealLayer.events.on({
        "featureselected": function (e) { show_ann_popup(e.feature)},
        "featureunselected": function (e) { hide_ann_popup(e.feature)},
        
        'visibilitychanged': function(e) {
            arealLayer.refresh({
                force:true,
                url: application_root + '/areal_text/?nodes='+taxon_nodes
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

    
    return map;
}
