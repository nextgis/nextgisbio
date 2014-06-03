define([
    'dijit/form/Button',
    'dijit/form/TextBox',
    'dijit/form/NumberTextBox',
    'dijit/form/Textarea',
    'dijit/form/CheckBox',
    'dijit/form/TimeTextBox',
    'ugrabio/CoordinatesPicker',
    'ugrabio/JsonFilteringSelect'
], function (Button, TextBox, NumberTextBox, Textarea, CheckBox, TimeTextBox, CoordinatesPicker, JsonFilteringSelect) {

    var getPersonJsonFilteringSelect = function (title, name, required) {
        return new JsonFilteringSelect({
            url: '/person_name',
            name: name,
            title: title,
            required: required,
            autoComplete: false,
            identifier: 'id',
            pageSize: 10,
            queryExpr: '${0}',
            style: 'width: 315px;'
        });
    };

    var model = {
        menuMap: {
            validate: function () {
                return ugrabio.is_auth;
            },
            'Карточки наблюдений': {
                items: [
                    {label: 'Млекопитающие', action: 'open/form', params: ['cardMammalia', 'Млекопитающие: создать карточку', '/cards/new']},
                    {label: 'Птицы', action: 'open/form', params: ['cardAves', 'Птицы: создать карточку', '/cards/new']},
                    {label: 'Рептилии, амфибии, рыбы', action: 'open/form', params: ['cardAra', 'Рептилии, амфибии, рыбы: создать карточку', '/cards/new']},
                    {label: 'Членистоногие', action: 'open/form', params: ['cardArthropoda', 'Членистоногие: создать карточку', '/cards/new']},
                    {label: 'Мхи', action: 'open/form', params: ['cardMoss', 'Мхи: создать карточку', '/cards/new']},
                    {label: 'Сосудистые растения', action: 'open/form', params: ['cardPlantae', 'Сосудистые растения: создать карточку', '/cards/new']},
                    {label: 'Грибы, лишайники', action: 'open/form', params: ['cardLichenes', 'Грибы, лишайники: создать карточку', '/cards/new']},
                    'separator',
                    {label: 'Экспорт в csv', action: 'open/window/taxon_list', params: ['/cards_download/csv/']},
                    {label: 'Экспорт в shp', action: 'open/window/taxon_list', params: ['/cards_download/shp/']}
                ]
            },
            'Аннотированные списки': {
                items: [
                    {label: 'Млекопитающие', action: 'open/form', params: ['anMammalia', 'Млекопитающие: создать список', '/annotation/new']},
                    {label: 'Птицы', action: 'open/form', params: ['anAves', 'Птицы: создать список', '/annotation/new']},
                    {label: 'Рептилии, амфибии, рыбы', action: 'open/form', params: ['anAra', 'Рептилии, амфибии, рыбы: создать список', '/annotation/new']},
                    {label: 'Членистоногие', action: 'open/form', params: ['anArthropoda', 'Членистоногие: создать список', '/annotation/new']},
                    {label: 'Мхи', action: 'open/form', params: ['anMoss', 'Мхи: создать список', '/annotation/new']},
                    {label: 'Сосудистые растения', action: 'open/form', params: ['anPlantae', 'Сосудистые растения: создать список', '/annotation/new']},
                    {label: 'Грибы, лишайники', action: 'open/form', params: ['anLichenes', 'Грибы, лишайники: создать список', '/annotation/new']},
                    'separator',
                    {label: 'Экспорт в csv', action: 'open/window/taxon_list', params: ['/anns_download/csv/']}
                ]
            },
            'Контурный ареал': {
                items: [
                    {label: 'Экспорт в shp', action: 'open/window/taxon_list', params: ['/areal/download/']}
                ]
            },
            'Сырой экспорт': {
                items: [
                    {label: 'abundance', action: 'open/window', params: ['/abundance_download']},
                    {label: 'annotation', action: 'open/window', params: ['/annotation_download']},
                    {label: 'anthr_press', action: 'open/window', params: ['/anthr_press_download']},
                    {label: 'area_type', action: 'open/window', params: ['/area_type_download']},
                    {label: 'cards', action: 'open/window', params: ['/cards_download']},
                    {label: 'coord_type', action: 'open/window', params: ['/coord_type_download']},
                    {label: 'footprint', action: 'open/window', params: ['/footprint_download']},
                    {label: 'inforesources', action: 'open/window', params: ['/inforesources_download']},
                    {label: 'key_area', action: 'open/window', params: ['/key_area_download']},
                    {label: 'legend', action: 'open/window', params: ['/legend_download']},
                    {label: 'museum', action: 'open/window', params: ['/museum_download']},
                    {label: 'person', action: 'open/window', params: ['/person_download']},
                    {label: 'pheno', action: 'open/window', params: ['/pheno_download']},
                    {label: 'square_karea_association', action: 'open/window', params: ['/square_karea_association_download']},
                    {label: 'synonym', action: 'open/window', params: ['/synonym_download']},
                    {label: 'taxa_scheme', action: 'open/window', params: ['/taxa_scheme_download']},
                    {label: 'taxon', action: 'open/window', params: ['/taxon_download']},
                    {label: 'user', action: 'open/window', params: ['/user_download']},
                    {label: 'vitality', action: 'open/window', params: ['/vitality_download']}
                ]
            },
            'Отчеты': {
                items: [
                    {label: 'Охраняемые виды', action: 'open/link/self', params: ['/reports/protected_species_list']}
                ]
            },
            'Администратор': {
                validate: function () {
                    return ugrabio.mode && ugrabio.mode === 'admin'
                },
                items: [
                    {label: 'Редактор таксонов', action: 'open/link/self', params: ['/taxons/editor']}
                ]
            }
        },

        forms: {
            'cardMammalia': {
                form: {
                    method: 'POST'
                },
                type: 'mammalia',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coordinatesPicker', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'anthr_press', 'vitality', 'habitat', 'footprint', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'unknown_sex', 'males', 'females', 'unknown_age', 'ad', 'sad', 'juv', 'pull']
            },
            'cardAves': {
                form: {
                    method: 'POST'
                },
                type: 'aves',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coordinatesPicker', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'anthr_press', 'vitality', 'footprint', 'habitat', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'unknown_sex', 'males', 'females', 'unknown_age', 'ad', 'sad', 'juv', 'pull', 'egs']
            },
            'cardAra': {
                form: {
                    method: 'POST'
                },
                type: 'ara',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coordinatesPicker', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'anthr_press', 'vitality', 'habitat', 'footprint', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'unknown_sex', 'males', 'females', 'unknown_age', 'ad', 'sad', 'juv', 'pull', 'egs']
            },
            'cardArthropoda': {
                form: {
                    method: 'POST'
                },
                type: 'arthropoda',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coordinatesPicker', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'substrat', 'anthr_press', 'vitality', 'habitat', 'footprint', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'unknown_sex', 'males', 'females', 'unknown_age', 'ad', 'sad', 'juv', 'pull', 'egs']
            },
            'cardMoss': {
                form: {
                    method: 'POST'
                },
                type: 'moss',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coordinatesPicker', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'anthr_press', 'vitality', 'habitat', 'substrat', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'abundance', 'area']
            },
            'cardPlantae': {
                form: {
                    method: 'POST'
                },
                type: 'plantae',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coordinatesPicker', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'substrat', 'anthr_press', 'vitality', 'habitat', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'abundance', 'area']
            },
            'cardLichenes': {
                form: {
                    method: 'POST'
                },
                type: 'lichenes',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coordinatesPicker', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'anthr_press', 'vitality', 'habitat', 'substrat', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'abundance', 'area']
            },
            'anMammalia': {
                form: {
                    method: 'POST'
                },
                type: 'mammalia',
                elements: ['id', 'species', 'original_name', 'collecter', 'identifier', 'key_area', 'lat', 'lon', 'location', 'annotation', 'biotop', 'difference', 'status', 'frequency', 'quantity', 'year', 'month', 'day', 'exposure', 'infosourse', 'biblioref']
            },
            'anAves': {
                form: {
                    method: 'POST'
                },
                type: 'aves',
                elements: ['id', 'species', 'original_name', 'collecter', 'identifier', 'key_area', 'lat', 'lon', 'location', 'annotation', 'biotop', 'difference', 'substrat', 'status', 'frequency', 'quantity', 'year', 'month', 'day', 'exposure', 'infosourse', 'biblioref']
            },
            'anAra': {
                form: {
                    method: 'POST'
                },
                type: 'ara',
                elements: ['id', 'species', 'original_name', 'collecter', 'identifier', 'key_area', 'lat', 'lon', 'location', 'annotation', 'biotop', 'difference', 'status', 'frequency', 'quantity', 'year', 'month', 'day', 'exposure', 'infosourse', 'biblioref']
            },
            'anArthropoda': {
                form: {
                    method: 'POST'
                },
                type: 'arthropoda',
                elements: ['id', 'species', 'original_name', 'collecter', 'identifier', 'key_area', 'lat', 'lon', 'location', 'annotation', 'biotop', 'difference', 'substrat', 'frequency', 'quantity', 'year', 'month', 'day', 'exposure', 'infosourse', 'biblioref']
            },
            'anMoss': {
                form: {
                    method: 'POST'
                },
                type: 'moss',
                elements: ['id', 'species', 'original_name', 'collecter', 'identifier', 'key_area', 'lat', 'lon', 'location', 'annotation', 'biotop', 'difference', 'frequency', 'quantity', 'year', 'month', 'day', 'exposure', 'infosourse', 'biblioref']
            },
            'anPlantae': {
                form: {
                    method: 'POST'
                },
                type: 'plantae',
                elements: ['id', 'species', 'original_name', 'collecter', 'identifier', 'key_area', 'lat', 'lon', 'location', 'annotation', 'biotop', 'difference', 'frequency', 'quantity', 'year', 'month', 'day', 'exposure', 'infosourse', 'biblioref']
            },
            'anLichenes': {
                form: {
                    method: 'POST'
                },
                type: 'lichenes',
                elements: ['id', 'species', 'original_name', 'collecter', 'identifier', 'key_area', 'lat', 'lon', 'location', 'annotation', 'biotop', 'difference', 'substrat', 'frequency', 'quantity', 'year', 'month', 'day', 'exposure', 'infosourse', 'biblioref']
            },
            'createTaxon': {
                form: {
                    method: 'POST'
                },
                elements: []
            }
        },

        elements: {
            id: function () {
                return new TextBox({
                    name: 'id',
                    type: 'hidden'
                })
            },
            species: {
                params: ['type'],
                action: function (type) {
                    return new JsonFilteringSelect({
                        url: '/species/' + type + '/',
                        name: 'species',
                        required: true,
                        autoComplete: false,
                        queryExpr: '${0}',
                        pageSize: 10,
                        title: 'Латинское название',
                        style: 'width: 315px;'});
                }
            },
            original_name: function () {
                return new TextBox({
                    name: 'original_name',
                    title: 'Исходное название',
                    readOnly: true,
                    style: 'width: 315px;'
                });
            },
            inserter: function () {
                return getPersonJsonFilteringSelect('Вносил', 'inserter', false);
            },
            observer: function () {
                return getPersonJsonFilteringSelect('Наблюдал', 'observer', false);
            },
            identifier: function () {
                return getPersonJsonFilteringSelect('Определил', 'identifier', false);
            },
            collecter: function () {
                return getPersonJsonFilteringSelect('Собрал', 'collecter', false);
            },
            abundance: function () {
                return new JsonFilteringSelect({
                    url: '/abundance_browse',
                    name: 'abundance',
                    queryExpr: '${0}',
                    searchAttr: 'abundance',
                    title: 'Количество (баллы)',
                    style: 'width: 315px;',
                    required: false
                });
            },
            annotation: function () {
                return new Textarea({
                    name: 'annotation',
                    title: 'Аннотация',
                    style: 'width: 315px;'
                });
            },
            anthr_press: function () {
                return new JsonFilteringSelect({
                    url: '/anthr_press_browse',
                    name: 'anthr_press',
                    queryExpr: '${0}',
                    searchAttr: 'anthr_press',
                    title: 'Антропогенная нагрузка',
                    required: false,
                    style: 'width: 315px;'});
            },
            area: function () {
                return new TextBox({name: 'area', title: 'Площадь популяции',
                    style: 'width: 315px;'});
            },
            biblioref: function () {
                return new JsonFilteringSelect({
                    url: '/inforesources_name',
                    name: 'biblioref',
                    queryExpr: '${0}',
                    searchAttr: 'filename',
                    labelAttr: 'filename',
                    required: false,
                    title: 'Библиографическая ссылка',
                    style: 'width: 315px;'});
            },
            inforesources: function () {
                return new JsonFilteringSelect({
                    url: '/inforesources_name',
                    name: 'inforesources',
                    queryExpr: '${0}',
                    searchAttr: 'filename',
                    labelAttr: 'filename',
                    required: false,
                    title: 'Источник информации',
                    style: 'width: 315px;'});
            },
            infosourse: function () {
                return new TextBox({
                    name: 'infosourse',
                    title: 'Источник информации',
                    style: 'width: 315px;'
                });
            },
            coord_type: function () {
                return new JsonFilteringSelect({
                    url: '/coord_type_browse',
                    name: 'coord_type',
                    queryExpr: '${0}',
                    searchAttr: 'coord_type',
                    title: 'Тип координат',
                    required: false,
                    style: 'width: 315px;'});
            },
            museum: function () {
                return new JsonFilteringSelect({
                    url: '/museum_browse',
                    name: 'museum',
                    queryExpr: '${0}',
                    searchAttr: 'museum',
                    title: 'Музейные образцы',
                    required: false,
                    style: 'width: 315px;'});
            },
            notes: function () {
                return new Textarea({
                    name: 'notes',
                    title: 'Примечания',
                    style: 'width: 315px;'});
            },
            pheno: function () {
                return new JsonFilteringSelect({
                    url: '/pheno_browse',
                    name: 'pheno',
                    queryExpr: '${0}',
                    searchAttr: 'pheno',
                    title: 'Фаза жизненного цикла',
                    required: false,
                    style: 'width: 315px;'});
            },
            photo: function () {
                return new CheckBox({name: 'photo', title: 'Фото'});
            },
            protection: function () {
                return new Textarea({name: 'protection', title: 'Меры защиты',
                    style: 'width: 315px;'});
            },
            publications: function () {
                return new Textarea({name: 'publications', title: 'Публикации',
                    style: 'width: 315px;'});
            },
            quantity: function () {
                return new NumberTextBox({name: 'quantity', title: 'Количество',
                    style: 'width: 315px;'});
            },
            substrat: function () {
                return new TextBox({name: 'substrat', title: 'Субстрат',
                    style: 'width: 315px;'});
            },
            status: function () {
                return new TextBox({name: 'status', title: 'Статус',
                    style: 'width: 315px;'});
            },
            year: function () {
                return new NumberTextBox({name: 'year', title: 'Год',
                    style: 'width: 315px;'});
            },
            month: function () {
                return new NumberTextBox({name: 'month', title: 'Месяц',
                    style: 'width: 315px;'});
            },
            time: function () {
                return new TimeTextBox({
                    name: 'time',
                    title: 'Время',
                    constraints: {
                        timePattern: 'dd/mm/yy HH:mm:ss'
                    },
                    style: 'width: 315px;'});
            },
            day: function () {
                return new NumberTextBox({name: 'day', title: 'День',
                    style: 'width: 315px;'});
            },
            exposure: function () {
                return new NumberTextBox({name: 'exposure', title: 'Длительность экспозиции',
                    style: 'width: 315px;'});
            },
            difference: function () {
                return new TextBox({name: 'difference', title: 'Отличия',
                    style: 'width: 315px;'});
            },
            females: function () {
                return new NumberTextBox({name: 'females', title: 'Самки',
                    style: 'width: 315px;'});
            },
            males: function () {
                return new NumberTextBox({name: 'males', title: 'Самцы',
                    style: 'width: 315px;'});
            },
            footprint: function () {
                return new JsonFilteringSelect({
                    url: '/footprint_browse',
                    name: 'footprint',
                    queryExpr: '${0}',
                    searchAttr: 'footprint',
                    title: 'Следы жизнедеятельности',
                    required: false,
                    style: 'width: 315px;'});
            },
            frequency: function () {
                return new TextBox({name: 'frequency', title: 'Частота встречаемости',
                    style: 'width: 315px;'});
            },
            habitat: function () {
                return new Textarea({name: 'habitat', title: 'Местообитание',
                    style: 'width: 315px;'});
            },
            vitality: function () {
                return new JsonFilteringSelect({
                    url: '/vitality_browse',
                    name: 'vitality',
                    queryExpr: '${0}',
                    searchAttr: 'vitality',
                    title: 'Состояние популяции',
                    required: false,
                    style: 'width: 315px;'});
            },
            unknown_age: function () {
                return new NumberTextBox({name: 'unknown_age', title: 'Возраст неопределен',
                    style: 'width: 315px;'});
            },
            unknown_sex: function () {
                return new NumberTextBox({name: 'unknown_sex', title: 'Пол неопределен',
                    style: 'width: 315px;'});
            },
            ad: function () {
                return new NumberTextBox({name: 'ad', title: 'Взрослые',
                    style: 'width: 315px;'});
            },
            sad: function () {
                return new NumberTextBox({name: 'sad', title: 'Предвзрослые',
                    style: 'width: 315px;'});
            },
            juv: function () {
                return new NumberTextBox({name: 'juv', title: 'Молодые',
                    style: 'width: 315px;'});
            },
            pull: function () {
                return new NumberTextBox({name: 'pull', title: 'Новорожденные',
                    style: 'width: 315px;'});
            },
            egs: function () {
                return new NumberTextBox({name: 'egs', title: 'Яйца',
                    style: 'width: 315px;'});
            },
            key_area: function () {
                return new JsonFilteringSelect({
                    url: '/key_area_browse',
                    name: 'key_area',
                    queryExpr: '${0}',
                    searchAttr: 'name',
                    pageSize: 10,
                    title: 'Ключевой участок',
                    required: true,
                    style: 'width: 315px;'});
            },
            lat: function () {
                return new NumberTextBox({name: 'lat', title: 'Широта',
                    style: 'width: 315px;'});
            },
            lon: function () {
                return new NumberTextBox({name: 'lon', title: 'Долгота',
                    style: 'width: 315px;'});
            },
            coordinatesPicker: function () {
                return new CoordinatesPicker({
                    name: 'coordPicker',
                    showLabel: true,
                    label: 'Указать координаты на карте'
                });
            },
            location: function () {
                return new Textarea({name: 'location', title: 'Геопривязка',
                    style: 'width: 315px;'});
            },
            limit_fact: function () {
                return new Textarea({name: 'limit_fact', title: 'Лимитирующие факторы',
                    style: 'width: 315px;'});
            },
            biotop: function () {
                return new TextBox({
                    name: 'biotop',
                    title: 'Биотоп',
                    style: 'width: 315px;'});
            },
            save_card: function () {
                return new Button({
                    label: 'Сохранить',
                    onClick: function () {

                    },
                    type: 'submit'
                });
            }
        }
    };

    return model;
})
;