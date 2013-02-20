
/* 
 * В файле определяются dataStore и поля,
 * небоходимые для отображения форм
 */ 

/*
 * ComboBox'ы для родительских царств/типов/классов/... таксонов
 */ 

// Возвращает поле ComboBox, описывающий таксон, для панели поиска

taxonComboTemplate = Ext.extend(Ext.form.ComboBox, {
    initComponent: function(){
        // Поля идентификаторов
        var fieldsList = [
            {name: 'recId',     mapping: 'recId'},
            {name: 'name',      mapping: 'name'},
            {name: 'id',        mapping: 'id'},
            {name: 'author',    mapping: 'author'},
            {name: 'source',    mapping: 'source'}
        ];
        var remoteJsonStore = new Ext.data.JsonStore({
            url: this.url,
            idProperty: 'recId',
            totalProperty: 'totalCount',
            root: 'data',
            fields : fieldsList,
            autoLoad: false,
            listeners: {
                exception: function(){
                    Ext.MessageBox.alert('Ошибка', "Ошибка при получении данных...");
                }
            }
        });
        remoteJsonStore.sort('name');
        Ext.apply(this, {
            xtype: 'combo',
            forceSelection: true,
            displayField: 'name',
            valueField: 'id',
            loadingText: 'Запрос....',
            minChars: 2,
            triggerAction: 'all',
            queryParam: 'taxon',
            tpl: new Ext.XTemplate(
                '<tpl for="."><div class="search-item">',
                    '<b>{name}</b> {author}',
                '</div></tpl>'
            ),
            itemSelector: 'div.search-item',
            store: remoteJsonStore
        });
        taxonComboTemplate.superclass.initComponent.call(this);
    }    
});
Ext.reg('taxonComboTemplate', taxonComboTemplate);

taxonCombo = new taxonComboTemplate({
    url: application_root + '/taxon/filter',
    fieldLabel: 'Таксон',
    listeners:{
        'select': function(combo, record, index) {
            // Добавим выбранный таксон в дерево таксонов,
            // подгрузив при необходимости
            // родительские ветви дерева

            id = record.data.id;
            var nodeID = 'taxon_' + id;
            var tree = Ext.getCmp('taxonsTree');
            if (!tree.getNodeById(nodeID)){
                // нужно подгрузить требуемую часть дерева
                Ext.Ajax.request({ 
                    url: application_root + '/taxon/' + id + '/parent_path',
                    success: function(response, request) {
                        var path = Ext.util.JSON.decode(response.responseText).path;
                        //var nodeID = 'taxon_' + path[path.length-1];
                        // выкинем последний id -- это id таксона
                        var path_arr = path.slice(0,-1);
                        path = '/root';
                        for (var i = 0; i < path_arr.length; i++) {
                            path = path + '/taxon_'+path_arr[i];
                        };
                        
                        tree.expandPath(path, 'id', 
                            function(bSuccess, oLastNode) {
                                if (bSuccess && tree.getNodeById(nodeID)) {
                                    node = tree.getNodeById(nodeID);
                                    node.ensureVisible();
                                    node.select();
                                    node.getUI().toggleCheck(true);
                                }
                            }
                        );
                    }
                });
            } else { // подгружать не нужно
                node = tree.getNodeById(nodeID);
                node.ensureVisible();
                node.select();
                node.getUI().toggleCheck(true);
            };
        }
    }
});

speciesCombo = Ext.extend(taxonComboTemplate, {
    initComponent: function(){
        Ext.apply(this, {
            fieldLabel: 'Лат. название',
            displayField: 'name', 
            valueField: 'id', 
            hiddenName: 'species',
            triggerAction: 'all',
            lazyRender: true,
            lazyInit: false,
            listeners:{
                'added': function(combo, owner, index) {
                    combo.store.load();
                }
            }
        });
        speciesCombo.superclass.initComponent.call(this);
    }
});

var personJsonStore = new Ext.data.JsonStore({
    url: application_root + '/person_name',
    idProperty: 'id',
    totalProperty: 'totalCount',
    root: 'data',
    fields : [
        {name: 'name',      mapping: 'name'},
        {name: 'id',        mapping: 'id'}
    ],
    listeners: {
        exception: function(){
            Ext.MessageBox.alert('Ошибка', "Ошибка при получении данных...");
        }
    },
    autoLoad: false
});
personJsonStore.load();

personCombo = Ext.extend(Ext.form.ComboBox, {
    initComponent: function(){
        Ext.apply(this, {
            xtype: 'combo',
            mode: 'local',
            triggerAction: 'all',
            store: personJsonStore,
            minChars: 0
        });
        personCombo.superclass.initComponent.call(this);
    }
});
Ext.reg('personCombo', personCombo);

// Музейные образцы
museumJsonStore = new Ext.data.JsonStore({url: application_root + '/museum_browse', idProperty: 'id',  totalProperty: 'totalCount', root: 'data', fields : [{name: 'museum',      mapping: 'museum'},{name: 'id',        mapping: 'id'}], autoLoad: false});
museumJsonStore.load();
museumJsonStore.sort('name');

// Инфоресурсы
inforesJsonStore = new Ext.data.JsonStore({url: application_root + '/inforesources_name',idProperty: 'id',totalProperty: 'totalCount',root: 'data',fields : [{name: 'filename',      mapping: 'filename'}, {name: 'id',        mapping: 'id'}],autoLoad: false});
inforesJsonStore.load();
inforesJsonStore.sort('name');

key_areaJsonStore = new Ext.data.JsonStore({url: application_root + '/key_area_browse', idProperty: 'id', totalProperty: 'totalCount', root: 'data', fields : [{name: 'name', mapping: 'name'},{name: 'id', mapping: 'id'}],autoLoad: false});
key_areaJsonStore.load();
key_areaJsonStore.sort('name');

coord_typeJsonStore =  new Ext.data.JsonStore({url: application_root + '/coord_type_browse', idProperty: 'id', totalProperty: 'totalCount', root: 'data', fields : [ {name: 'coord_type',      mapping: 'coord_type'}, {name: 'id',        mapping: 'id'} ], autoLoad: false}); 
coord_typeJsonStore.load();
coord_typeJsonStore.sort('coord_type');

anthr_pressJsonStore = new Ext.data.JsonStore({url: application_root + '/anthr_press_browse', idProperty: 'id', totalProperty: 'totalCount', root: 'data', fields : [ {name: 'anthr_press',      mapping: 'anthr_press'}, {name: 'id',        mapping: 'id'} ], autoLoad: false}); 
anthr_pressJsonStore.load();
anthr_pressJsonStore.sort('anthr_press');

vitalityJsonStore =  new Ext.data.JsonStore({
    url: application_root + '/vitality_browse',
    idProperty: 'id', 
    totalProperty: 'totalCount', 
    root: 'data', 
    fields : [ {name: 'vitality',      mapping: 'vitality'}, {name: 'id',        mapping: 'id'}, {name: 'org_type',        mapping: 'org_type'} ], 
    autoLoad: false
}); 
vitalityJsonStore.load();
vitalityJsonStore.sort('vitality');

phenoJsonStore = new Ext.data.JsonStore({
    url: application_root + '/pheno_browse', 
    idProperty: 'id', 
    totalProperty: 'totalCount', 
    root: 'data', 
    fields : [ {name: 'pheno',      mapping: 'pheno'}, {name: 'id',        mapping: 'id'}, {name: 'org_type',        mapping: 'org_type'}], 
    autoLoad: true
}); 
phenoJsonStore.sort('pheno');

abundanceJsonStore = new Ext.data.JsonStore({url: application_root + '/abundance_browse', idProperty: 'id', totalProperty: 'totalCount', root: 'data', fields : [ {name: 'abundance',      mapping: 'abundance'}, {name: 'id',        mapping: 'id'} ], autoLoad: false}) 
abundanceJsonStore.load();
abundanceJsonStore.sort('abundance');

footprintJsonStore = new Ext.data.JsonStore({
    url: application_root + '/footprint_browse', 
    idProperty: 'id', 
    totalProperty: 'totalCount', 
    root: 'data', 
    fields : [ {name: 'footprint',      mapping: 'footprint'}, {name: 'id',        mapping: 'id'},{name: 'org_type',        mapping: 'org_type'} ], 
    autoLoad: false
}) 
footprintJsonStore.load();
footprintJsonStore.sort('footprint');

// В функции определяются поля карточек наблюдений и  
// аннотированных списков (все, какие возможны)
// При вызове функции нужные поля перечисляются в списке названий полей
// fieldsList. Эти поля вернет функция в качестве результата
getFields = function(fieldsList, taxonId, orgType){
    var idURL = taxonId ? taxonId : '';
    var URL = application_root + '/species/' + orgType +'/'+ idURL;
    var fields = {
        'id': { // id записи
            xtype      : 'hidden',
            name: 'id'
        },
        'species': new speciesCombo({url: URL}), 
        'inserter': new personCombo({ // Вносил
            fieldLabel: 'Вносил', 
            displayField: 'name', 
            valueField: 'id', 
            hiddenName: 'inserter',
            allowBlank: false
        }),
        'observer': new personCombo({ // Наблюдал
            fieldLabel: 'Наблюдал', 
            displayField: 'name', 
            valueField: 'id', 
            hiddenName: 'observer'
        }),
        'identifier': new personCombo({ // Определил
            fieldLabel: 'Определил', 
            displayField: 'name', 
            valueField: 'id', 
            hiddenName: 'identifier'
        }),
        'collecter': new personCombo({ // Собрал (анн. списки)
            fieldLabel: 'Собрал', 
            displayField: 'name', 
            valueField: 'id', 
            hiddenName: 'collecter'
        }),
        
        'abundance': new Ext.form.ComboBox({ // Количество (баллы)
            fieldLabel: 'Количество (баллы)', 
            displayField: 'abundance', 
            valueField: 'id', 
            hiddenName: 'abundance',
            minChars: 0,
            triggerAction: 'all',
            store: abundanceJsonStore,
            mode: 'local'
        }),
        
        'annotation': { // Аннотация (анн. сп.)
            fieldLabel: 'Аннотация',
            name: 'annotation',
            allowBlank: true,
            emptyText: '',
            xtype: 'textarea'
        },
        
        'anthr_press': new Ext.form.ComboBox({ // Антропогенная нагрузка
            fieldLabel: 'Антропогенная нагрузка', 
            displayField: 'anthr_press', 
            valueField: 'id', 
            hiddenName: 'anthr_press',
            minChars: 0,
            triggerAction: 'all',
            store: anthr_pressJsonStore,
            mode: 'local'
        }),
        
        'area': { // Площадь популяции
            xtype: 'textfield',
            fieldLabel: 'Площадь популяции',
            name: 'area',
            allowBlank: true,
            emptyText: '',
            minValue: 0
        },
        
        'biblioref': new Ext.form.ComboBox({ // Библиографическая ссылка
            fieldLabel: 'Библиографическая ссылка', 
            displayField: 'filename', 
            valueField: 'id', 
            hiddenName: 'biblioref',
            minChars: 0,
            triggerAction: 'all',
            store: inforesJsonStore,
            mode: 'local'
        }),
        
        'biotop': { // Биотоп (анн. сп.)
            fieldLabel: 'Биотоп',
            name: 'biotop',
            allowBlank: true,
            emptyText: ''
        },
        
        'coord_type': new Ext.form.ComboBox({ // Тип координат
            fieldLabel: 'Тип координат', 
            displayField: 'coord_type', 
            valueField: 'id', 
            hiddenName: 'coord_type',
            minChars: 0,
            triggerAction: 'all',
            store: coord_typeJsonStore,
            mode: 'local'
        }),
        
        'day': { // День
            xtype: 'numberfield',
            fieldLabel: 'День',
            name: 'day',
            allowBlank: true,
            emptyText: '',
            maskRe: /[0-9]/i,
            maxValue: 31,
            minValue: 1
        },
        
        'difference': { // Отличия (анн. сп.)
            fieldLabel: 'Отличия',
            name: 'difference',
            allowBlank: true,
            emptyText: ''
        },
        
        'exposure': { // Длительность экспозиции (анн. сп.)
            xtype: 'numberfield',
            fieldLabel: 'Длительность экспозиции',
            name: 'exposure',
            allowBlank: true,
            emptyText: ''
        },
        
        'females': { // Самки
            xtype: 'numberfield',
            fieldLabel: 'Самки',
            name: 'females',
            allowBlank: true,
            emptyText: '',
            minValue: 0
        },
        
        'footprint': new Ext.form.ComboBox({ // Следы жизнедеятельности
            fieldLabel: 'Следы жизнедеятельности', 
            displayField: 'footprint', 
            valueField: 'id', 
            hiddenName: 'footprint',
            minChars: 0,
            triggerAction: 'all',
            store: footprintJsonStore,
            mode: 'local',
            orgType: orgType,
            listeners: {
                'expand': function(combo) {
                    this.store.clearFilter();
                    this.store.filter('org_type', this.orgType);
                }
            }
        }),
        
        'frequency': { // Частота встречаемости (анн. сп.)
            fieldLabel: 'Частота встречаемости',
            name: 'frequency',
            allowBlank: true,
            emptyText: ''
        },
        
        'habitat': { // Местообитание
            xtype:  'textarea',
            fieldLabel: 'Местообитание',
            name: 'habitat',
            allowBlank: true,
            emptyText: ''
        },
        
        'inforesources': new Ext.form.ComboBox({ // Источник информации
            fieldLabel: 'Источник информации', 
            displayField: 'filename', 
            valueField: 'id', 
            hiddenName: 'inforesources',
            minChars: 0,
            triggerAction: 'all',
            store: inforesJsonStore,
            mode: 'local'
        }),
        
        'infosourse': { // Источник информации (анн. сп.)
            fieldLabel: 'Источник информации',
            name: 'infosourse',
            allowBlank: true,
            emptyText: ''
        },
        
        'key_area': new Ext.form.ComboBox({ // Ключевой участок (анн. списки)
            fieldLabel: 'Ключевой участок', 
            displayField: 'name', 
            valueField: 'id', 
            hiddenName: 'key_area',
            minChars: 0,
            triggerAction: 'all',
            allowBlank: false,
            store: key_areaJsonStore,
            mode: 'local'
        }),
        
        'lat': {  // Широта
            xtype: 'numberfield',
            fieldLabel: 'Широта',
            name: 'lat',
            allowBlank: true,
            emptyText: '',
            maxValue: 90,
            minValue: -90,
            decimalPrecision: 6
        },
        'lon': { // Долгота
            xtype: 'numberfield',
            fieldLabel: 'Долгота',
            name: 'lon',
            allowBlank: true,
            emptyText: '',
            maxValue: 180,
            minValue: -180,
            decimalPrecision: 6
        },
        'location': { // Геопривязка
            xtype:  'textarea',
            fieldLabel: 'Геопривязка',
            name: 'location',
            allowBlank: true,
            emptyText: ''
        },
        
        'limit_fact': { // Лимитирующие факторы
            xtype:  'textarea',
            fieldLabel: 'Лимитирующие факторы',
            name: 'limit_fact',
            allowBlank: true,
            emptyText: ''
        },
        
        'males': { // Самцы
            xtype: 'numberfield',
            fieldLabel: 'Самцы',
            name: 'males',
            allowBlank: true,
            emptyText: '',
            minValue: 0
        },
        
        'month': { // Месяц
            xtype: 'numberfield',
            fieldLabel: 'Месяц',
            name: 'month',
            allowBlank: true,
            emptyText: '',
            maskRe: /[0-9]/i,
            maxValue: 12,
            minValue: 1
        },
        
        'museum': new Ext.form.ComboBox({ // Музейные образцы
            fieldLabel: 'Музейные образцы', 
            displayField: 'museum', 
            valueField: 'id', 
            hiddenName: 'museum',
            minChars: 0,
            triggerAction: 'all',
            store: museumJsonStore,
            mode: 'local'
        }),
        
        'notes': { // Примечания
            xtype:  'textarea',
            fieldLabel: 'Примечания',
            name: 'notes',
            allowBlank: true,
            emptyText: ''
        },
        
        'original_name': { // Исходное название (анн. сп.)
            fieldLabel: 'Исходное название',
            name: 'original_name',
            allowBlank: true,
            emptyText: '', 
            readOnly: true,
            style: 'color:gray'
        },
        
        'pheno': new Ext.form.ComboBox({ // Фаза ЖЦ
            fieldLabel: 'Фаза жизненного цикла', 
            displayField: 'pheno', 
            valueField: 'id', 
            hiddenName: 'pheno',
            minChars: 0,
            triggerAction: 'all',
            store: phenoJsonStore,
            mode: 'local',
            orgType: orgType,
            listeners: {
                'expand': function(combo) {
                    this.store.clearFilter();
                    this.store.filter('org_type', this.orgType);
                }
            }
        }),
        
        'photo': { // Фото
            fieldLabel: 'Фото',
            name: 'photo',
            allowBlank: true,
            xtype      : 'checkbox'
        },
        
        'protection': { // Меры защиты
            xtype:  'textarea',
            fieldLabel: 'Меры защиты',
            name: 'protection',
            allowBlank: true,
            emptyText: ''
        },
        
        'publications': { // Публикации
            xtype:  'textarea',
            fieldLabel: 'Публикации',
            name: 'publications',
            allowBlank: true,
            emptyText: ''
        },
        
        'quantity': { // Количество
            xtype: 'numberfield',
            fieldLabel: 'Количество',
            name: 'quantity',
            allowBlank: true,
            emptyText: '',
            minValue: 0
        },
        
        'substrat': { // Субстрат
            fieldLabel: 'Субстрат',
            name: 'substrat',
            allowBlank: true,
            emptyText: ''
        },
        
        'status': { // Статус (анн. сп.)
            fieldLabel: 'Статус',
            name: 'status',
            allowBlank: true,
            emptyText: ''
        },
        
        'time': { // Время
            fieldLabel: 'Время',
            name: 'time',
            allowBlank: true,
            maskRe: /[0-9/: ]/i
        },
        
        
        'vitality': new Ext.form.ComboBox({ // Состояние популяции
            fieldLabel: 'Состояние популяции', 
            displayField: 'vitality', 
            valueField: 'id', 
            hiddenName: 'vitality',
            minChars: 0,
            triggerAction: 'all',
            store: vitalityJsonStore,
            mode: 'local',
            orgType: orgType,
            listeners: {
                'expand': function(combo) {
                    this.store.clearFilter();
                    this.store.filter('org_type', this.orgType);
                }
            }
        }),
        
        'unknown_age': { // Возраст неопределен
            xtype: 'numberfield',
            fieldLabel: 'Возраст неопределен',
            name: 'unknown_age',
            allowBlank: true,
            emptyText: '',
            minValue: 0
        },
        
        'unknown_sex': { // Пол неопределен
            xtype: 'numberfield',
            fieldLabel: 'Пол неопределен',
            name: 'unknown_sex',
            allowBlank: true,
            emptyText: '',
            minValue: 0
        },
        
        'year': { // Год
            xtype: 'numberfield',
            fieldLabel: 'Год',
            name: 'year',
            allowBlank: true,
            emptyText: '',
            maxValue: 2050,
            minValue: 1900
        },
        
        
        'ad': { // Ad
            xtype: 'numberfield',
            fieldLabel: 'Взрослые',
            name: 'ad',
            allowBlank: true,
            emptyText: '',
            minValue: 0
        },
        'sad': { // Sad
            xtype: 'numberfield',
            fieldLabel: 'Предвзрослые',
            name: 'sad',
            allowBlank: true,
            emptyText: '',
            minValue: 0
        },
        'juv': { // Juv
            xtype: 'numberfield',
            fieldLabel: 'Молодые',
            name: 'juv',
            allowBlank: true,
            emptyText: '',
            minValue: 0
        },
        'pull': { // Pull
            xtype: 'numberfield',
            fieldLabel: 'Новорожденные',
            name: 'pull',
            allowBlank: true,
            emptyText: '',
            minValue: 0
        },
        'egs': { // Eggs
            xtype: 'numberfield',
            fieldLabel: 'Яйца',
            name: 'egs',
            allowBlank: true,
            emptyText: '',
            minValue: 0
        }
    };
    var result = [];
    for (var i=0; i< fieldsList.length; i++){
        result.push(fields[fieldsList[i]]);
    };
    return result;
}


/*
 * Поля карточек наблюдений
 */

// Поля, карточки птиц
avesCardFields = [
    'id',
    'species',
    'original_name',
    'inserter',
    'observer',
    'identifier',
    'museum',
    'location',
    'lat',
    'lon',
    'coord_type',
    'year',
    'month',
    'day',
    'time',
    'photo',
    'anthr_press',
    'vitality',
    'footprint',
    'habitat',
    'limit_fact',
    'protection',
    'notes',
    'inforesources',
    'publications',
    'pheno',
    'quantity',
    'unknown_sex',
    'males',
    'females',
    'unknown_age',
    'ad',
    'sad',
    'juv',
    'pull',
    'egs'
];
// Поля рептилий, амфибий и рыб
araCardFields = [
    'id',
    'species',
    'original_name',
    'inserter',
    'observer',
    'identifier',
    'museum',
    'location',
    'lat',
    'lon',
    'coord_type',
    'year',
    'month',
    'day',
    'time',
    'photo',
    'anthr_press',
    'vitality',
    'habitat',
    'footprint',
    'limit_fact',
    'protection',
    'notes',
    'inforesources',
    'publications',
    'pheno',
    'quantity',
    'unknown_sex',
    'males',
    'females',
    'unknown_age',
    'ad',
    'sad',
    'juv',
    'pull',
    'egs'
];

// Поля, карточки млекопитающих
mammaliaCardFields = [
    'id',
    'species',
    'original_name',
    'inserter',
    'observer',
    'identifier',
    'museum',
    'location',
    'lat',
    'lon',
    'coord_type',
    'year',
    'month',
    'day',
    'time',
    'photo',
    'anthr_press',
    'vitality',
    'habitat',
    'footprint',
    'limit_fact',
    'protection',
    'notes',
    'inforesources',
    'publications',
    'pheno',
    'quantity',
    'unknown_sex',
    'males',
    'females',
    'unknown_age',
    'ad',
    'sad',
    'juv',
    'pull'
];

// членистоногие
arthropodaCardFields = [
    'id',
    'species',
    'original_name',
    'inserter',
    'observer',
    'identifier',
    'museum',
    'location',
    'lat',
    'lon',
    'coord_type',
    'year',
    'month',
    'day',
    'time',
    'photo',
    'substrat',
    'anthr_press',
    'vitality',
    'habitat',
    'footprint',
    'limit_fact',
    'protection',
    'notes',
    'inforesources',
    'publications',
    'pheno',
    'quantity',
    'unknown_sex',
    'males',
    'females',
    'unknown_age',
    'ad',
    'sad',
    'juv',
    'pull',
    'egs'
];
// мхи
mossCardFields = [
    'id',
    'species',
    'original_name',
    'inserter',
    'observer',
    'identifier',
    'museum',
    'location',
    'lat',
    'lon',
    'coord_type',
    'year',
    'month',
    'day',
    'time',
    'photo',
    'anthr_press',
    'vitality',
    'habitat',
    'substrat',
    'limit_fact',
    'protection',
    'notes',
    'inforesources',
    'publications',
    'pheno',
    'abundance',
    'area'
];
// лишайники
lichenesCardFields = [
    'id',
    'species',
    'original_name',
    'inserter',
    'observer',
    'identifier',
    'museum',
    'location',
    'lat',
    'lon',
    'coord_type',
    'year',
    'month',
    'day',
    'time',
    'photo',
    'anthr_press',
    'vitality',
    'habitat',
    'substrat',
    'limit_fact',
    'protection',
    'notes',
    'inforesources',
    'publications',
    'pheno',
    'quantity',
    'abundance',
    'area'
];
// сосуд. раст.
plantaeCardFields = [
    'id',
    'species',
    'original_name',
    'inserter',
    'observer',
    'identifier',
    'museum',
    'location',
    'lat',
    'lon',
    'coord_type',
    'year',
    'month',
    'day',
    'time',
    'photo',
    'substrat',
    'anthr_press',
    'vitality',
    'habitat',
    'limit_fact',
    'protection',
    'notes',
    'inforesources',
    'publications',
    'pheno',
    'quantity',
    'abundance',
    'area'
];


/*
 * Поля аннотированных списков
 */

mammaliaAnnListFields = [
    'id',
    'species',
    'original_name',
    'collecter',
    'identifier',
    'key_area',
    'lat',
    'lon',
    'location',
    'annotation',
    'biotop',
    'difference', 
    
    'status',
    'frequency',
    'quantity',

    'year',
    'month',
    'day',
    'exposure',
    
    'infosourse',
    'biblioref'
];

avesAnnListFields = [
    'id',
    'species',
    'original_name',
    'collecter',
    'identifier',
    'key_area',
    'lat',
    'lon',
    'location',
    'annotation',
    'biotop',
    'difference', 
    
    'substrat',
    'status',
    'frequency',
    'quantity',

    'year',
    'month',
    'day',
    'exposure',
    
    'infosourse',
    'biblioref'
];
araAnnListFields = [
    'id',
    'species',
    'original_name',
    'collecter',
    'identifier',
    'key_area',
    'lat',
    'lon',
    'location',
    'annotation',
    'biotop',
    'difference', 
    
    'status',
    'frequency',
    'quantity',

    'year',
    'month',
    'day',
    'exposure',
    
    'infosourse',
    'biblioref'
];


arthropodaAnnListFields = [
    'id',
    'species',
    'original_name',
    'collecter',
    'identifier',
    'key_area',
    'lat',
    'lon',
    'location',
    'annotation',
    'biotop',
    'difference', 
    
    'substrat',
    'frequency',
    'quantity',

    'year',
    'month',
    'day',
    'exposure',
    
    'infosourse',
    'biblioref'
];
lichenesAnnListFields = [
    'id',
    'species',
    'original_name',
    'collecter',
    'identifier',
    'key_area',
    'lat',
    'lon',
    'location',
    'annotation',
    'biotop',
    'difference', 
    
    'substrat',
    'frequency',
    'quantity',

    'year',
    'month',
    'day',
    'exposure',
    
    'infosourse',
    'biblioref'
];

mossAnnListFields = [
    'id',
    'species',
    'original_name',
    'collecter',
    'identifier',
    'key_area',
    'lat',
    'lon',
    'location',
    'annotation',
    'biotop',
    'difference', 
    
    'frequency',
    'quantity',

    'year',
    'month',
    'day',
    'exposure',
    
    'infosourse',
    'biblioref'
];
plantaeAnnListFields = [
    'id',
    'species',
    'original_name',
    'collecter',
    'identifier',
    'key_area',
    'lat',
    'lon',
    'location',
    'annotation',
    'biotop',
    'difference', 
    
    'frequency',
    'quantity',

    'year',
    'month',
    'day',
    'exposure',
    
    'infosourse',
    'biblioref'
];


// По id таксона выясняет его тип ('mammalia', 'aves', 'plantae',...)
// затем возвращает список полей, пригодный для создания формы в функции tableRowForm
cardFieldlistByTaxonId = function(taxonId){
    var fields =  {
        "arthropoda":   arthropodaCardFields, 
        "ara":          araCardFields, 
        "mammalia":     mammaliaCardFields, 
        "moss":         mossCardFields, 
        "aves":         avesCardFields, 
        "plantae":      plantaeCardFields, 
        "lichenes":     lichenesCardFields
    };
    var response = httpGet(application_root + '/taxon/'+taxonId+'/type');
    var descript = Ext.decode(response);
    for (var taxonType in descript) {
        if (descript[taxonType]) {
            phenoJsonStore.filter('org_type', taxonType);
            var fieldsList = getFields(fields[taxonType], taxonId, taxonType);
            return fieldsList;
        }
    };
};

// По id таксона выясняет его тип ('mammalia', 'aves', 'plantae',...)
// затем возвращает список полей, пригодный для создания формы в функции showAnnList
annFieldlistByTaxonId = function(taxonId){
    var fields =  {
        "arthropoda":   arthropodaAnnListFields, 
        "ara":          araAnnListFields, 
        "mammalia":     mammaliaAnnListFields, 
        "moss":         mossAnnListFields, 
        "aves":         avesAnnListFields, 
        "plantae":      plantaeAnnListFields, 
        "lichenes":     lichenesAnnListFields
    };
    var response = httpGet(application_root + '/taxon/'+taxonId+'/type');
    var descript = Ext.decode(response);
    for (var taxonType in descript) {
        if (descript[taxonType]) {
            return getFields(fields[taxonType], taxonId, taxonType);
        }
    };
};
