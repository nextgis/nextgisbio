define([
    'dijit/form/Button',
    'dijit/form/TextBox',
    'dijit/form/NumberTextBox',
    'dijit/form/Textarea',
    'dijit/form/CheckBox',
    'dijit/form/TimeTextBox',
    'ugrabio/JsonFilteringSelect'
], function (Button, TextBox, NumberTextBox, Textarea, CheckBox, TimeTextBox, JsonFilteringSelect) {

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
            style: 'width: 215px;'
        });
    };

    return {
        menuList: {
            'Карточки наблюдений': [
                {label: 'Млекопитающие', action: 'open/form', params: ['cardMammalia']},
                {label: 'Птицы', action: 'open/form', params: ['cardAves']},
                {label: 'Рептилии, амфибии, рыбы', action: 'open/form', params: ['cardAra']},
                {label: 'Членистоногие', action: 'open/form', params: ['cardArthropoda']},
                {label: 'Мхи', action: 'open/form', params: ['cardMoss']},
                {label: 'Сосудистые растения', action: 'open/form', params: ['cardPlantae']},
                {label: 'Грибы, лишайники', action: 'open/form', params: ['cardLichenes']},
                'separator',
                {label: 'Экспорт в csv', action: ''},
                {label: 'Экспорт в shp'}
            ],
            'Аннотированные списки': [
                {label: 'Млекопитающие', action: 'open/form', params: ['anMammalia']},
                {label: 'Птицы', action: 'open/form', params: ['anAves']},
                {label: 'Рептилии, амфибии, рыбы', action: 'open/form', params: ['anAra']},
                {label: 'Членистоногие', action: 'open/form', params: ['anArthropoda']},
                {label: 'Мхи', action: 'open/form', params: ['anMoss']},
                {label: 'Сосудистые растения', action: 'open/form', params: ['anPlantae']},
                {label: 'Грибы, лишайники', action: 'open/form', params: ['anLichenes']},
                'separator',
                {label: 'Экспорт в csv'}
            ],
            'Контурный ареал': [
                {label: 'Экспорт в shp'}
            ],
            'Сырой экспорт': [
                {label: 'abundance', action: ''},
                {label: 'annotation', action: ''},
                {label: 'anthr_press', action: ''},
                {label: 'area_type', action: ''},
                {label: 'cards', action: ''},
                {label: 'coord_type', action: ''},
                {label: 'footprint', action: ''},
                {label: 'inforesources', action: ''},
                {label: 'key_area', action: ''},
                {label: 'legend', action: ''},
                {label: 'museum', action: ''},
                {label: 'person', action: ''},
                {label: 'pheno', action: ''},
                {label: 'square_karea_association', action: ''},
                {label: 'synonym', action: ''},
                {label: 'taxa_scheme', action: ''},
                {label: 'taxon', action: ''},
                {label: 'user', action: ''},
                {label: 'vitality'}
            ]
        },

        forms: {
            'cardMammalia': {
                form: {action: '/cards/new', method: 'POST'},
                type: 'mammalia',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'anthr_press', 'vitality', 'habitat', 'footprint', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'unknown_sex', 'males', 'females', 'unknown_age', 'ad', 'sad', 'juv', 'pull']},
            'cardAves': {
                form: {action: '/cards/new', method: 'POST'},
                type: 'aves',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'anthr_press', 'vitality', 'footprint', 'habitat', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'unknown_sex', 'males', 'females', 'unknown_age', 'ad', 'sad', 'juv', 'pull', 'egs']},
            'cardAra': {
                form: {action: '/cards/new', method: 'POST'},
                type: 'ara',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'anthr_press', 'vitality', 'habitat', 'footprint', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'unknown_sex', 'males', 'females', 'unknown_age', 'ad', 'sad', 'juv', 'pull', 'egs']},
            'cardArthropoda': {
                form: {action: '/cards/new', method: 'POST'},
                type: 'arthropoda',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'substrat', 'anthr_press', 'vitality', 'habitat', 'footprint', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'unknown_sex', 'males', 'females', 'unknown_age', 'ad', 'sad', 'juv', 'pull', 'egs']},
            'cardMoss': {
                form: {action: '/cards/new', method: 'POST'},
                type: 'moss',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'anthr_press', 'vitality', 'habitat', 'substrat', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'abundance', 'area']},
            'cardPlantae': {
                form: {action: '/cards/new', method: 'POST'},
                type: 'plantae',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'substrat', 'anthr_press', 'vitality', 'habitat', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'abundance', 'area']},
            'cardLichenes': {
                form: {action: '/cards/new', method: 'POST'},
                type: 'lichenes',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'anthr_press', 'vitality', 'habitat', 'substrat', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'abundance', 'area']},
            'anMammalia': {
                form: {action: '/annotation/new', method: 'POST'},
                type: 'mammalia',
                elements: ['id', 'species', 'original_name', 'collecter', 'identifier', 'key_area', 'lat', 'lon', 'location', 'annotation', 'biotop', 'difference', 'status', 'frequency', 'quantity', 'year', 'month', 'day', 'exposure', 'infosourse', 'biblioref']
            },
            'anAves': {
                form: {action: '/annotation/new', method: 'POST'},
                type: 'aves',
                elements: ['id', 'species', 'original_name', 'collecter', 'identifier', 'key_area', 'lat', 'lon', 'location', 'annotation', 'biotop', 'difference', 'substrat', 'status', 'frequency', 'quantity', 'year', 'month', 'day', 'exposure', 'infosourse', 'biblioref']
            },
            'anAra': {
                form: {action: '/annotation/new', method: 'POST'},
                type: 'ara',
                elements: ['id', 'species', 'original_name', 'collecter', 'identifier', 'key_area', 'lat', 'lon', 'location', 'annotation', 'biotop', 'difference', 'status', 'frequency', 'quantity', 'year', 'month', 'day', 'exposure', 'infosourse', 'biblioref']},
            'anArthropoda': {
                form: {action: '/annotation/new', method: 'POST'},
                type: 'arthropoda',
                elements: ['id', 'species', 'original_name', 'collecter', 'identifier', 'key_area', 'lat', 'lon', 'location', 'annotation', 'biotop', 'difference', 'substrat', 'frequency', 'quantity', 'year', 'month', 'day', 'exposure', 'infosourse', 'biblioref']},
            'anMoss': {
                form: {action: '/annotation/new', method: 'POST'},
                type: 'moss',
                elements: ['id', 'species', 'original_name', 'collecter', 'identifier', 'key_area', 'lat', 'lon', 'location', 'annotation', 'biotop', 'difference', 'frequency', 'quantity', 'year', 'month', 'day', 'exposure', 'infosourse', 'biblioref']},
            'anPlantae': {
                form: {action: '/annotation/new', method: 'POST'},
                type: 'plantae',
                elements: ['id', 'species', 'original_name', 'collecter', 'identifier', 'key_area', 'lat', 'lon', 'location', 'annotation', 'biotop', 'difference', 'frequency', 'quantity', 'year', 'month', 'day', 'exposure', 'infosourse', 'biblioref']
            },
            'anLichenes': {
                form: {action: '/annotation/new', method: 'POST'},
                type: 'lichenes',
                elements: ['id', 'species', 'original_name', 'collecter', 'identifier', 'key_area', 'lat', 'lon', 'location', 'annotation', 'biotop', 'difference', 'substrat', 'frequency', 'quantity', 'year', 'month', 'day', 'exposure', 'infosourse', 'biblioref']
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
                        style: 'width: 215px;'});
                }
            },
            original_name: function () {
                return new TextBox({
                    name: 'original_name',
                    title: 'Исходное название',
                    readOnly: true,
                    style: 'width: 215px;'
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
                    style: 'width: 215px;',
                    required: false
                });
            },
            annotation: function () {
                return new Textarea({
                    name: 'annotation',
                    title: 'Аннотация',
                    style: 'width: 215px;'
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
                    style: 'width: 215px;'});
            },
            area: function () {
                return new TextBox({name: 'area', title: 'Площадь популяции',
                    style: 'width: 215px;'});
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
                    style: 'width: 215px;'});
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
                    style: 'width: 215px;'});
            },
            infosourse: function () {
                return new TextBox({
                    name: 'infosourse',
                    title: 'Источник информации',
                    style: 'width: 215px;'
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
                    style: 'width: 215px;'});
            },
            museum: function () {
                return new JsonFilteringSelect({
                    url: '/museum_browse',
                    name: 'museum',
                    queryExpr: '${0}',
                    searchAttr: 'museum',
                    title: 'Музейные образцы',
                    required: false,
                    style: 'width: 215px;'});
            },
            notes: function () {
                return new Textarea({
                    name: 'notes',
                    title: 'Примечания',
                    style: 'width: 215px;'});
            },
            pheno: function () {
                return new JsonFilteringSelect({
                    url: '/pheno_browse',
                    name: 'pheno',
                    queryExpr: '${0}',
                    searchAttr: 'pheno',
                    title: 'Фаза жизненного цикла',
                    required: false,
                    style: 'width: 215px;'});
            },
            photo: function () {
                return new CheckBox({name: 'photo', title: 'Фото'});
            },
            protection: function () {
                return new Textarea({name: 'protection', title: 'Меры защиты',
                    style: 'width: 215px;'});
            },
            publications: function () {
                return new Textarea({name: 'publications', title: 'Публикации',
                    style: 'width: 215px;'});
            },
            quantity: function () {
                return new NumberTextBox({name: 'quantity', title: 'Количество',
                    style: 'width: 215px;'});
            },
            substrat: function () {
                return new TextBox({name: 'substrat', title: 'Субстрат',
                    style: 'width: 215px;'});
            },
            status: function () {
                return new TextBox({name: 'status', title: 'Статус',
                    style: 'width: 215px;'});
            },
            year: function () {
                return new NumberTextBox({name: 'year', title: 'Год',
                    style: 'width: 215px;'});
            },
            month: function () {
                return new NumberTextBox({name: 'month', title: 'Месяц',
                    style: 'width: 215px;'});
            },
            time: function () {
                return new TimeTextBox({
                    name: 'time',
                    title: 'Время',
                    constraints: {
                        timePattern: 'dd/mm/yy HH:mm:ss'
                    },
                    style: 'width: 215px;'});
            },
            day: function () {
                return new NumberTextBox({name: 'day', title: 'День',
                    style: 'width: 215px;'});
            },
            exposure: function () {
                return new NumberTextBox({name: 'exposure', title: 'Длительность экспозиции',
                    style: 'width: 215px;'});
            },
            difference: function () {
                return new TextBox({name: 'difference', title: 'Отличия',
                    style: 'width: 215px;'});
            },
            females: function () {
                return new NumberTextBox({name: 'females', title: 'Самки',
                    style: 'width: 215px;'});
            },
            males: function () {
                return new NumberTextBox({name: 'males', title: 'Самцы',
                    style: 'width: 215px;'});
            },
            footprint: function () {
                return new JsonFilteringSelect({
                    url: '/footprint_browse',
                    name: 'footprint',
                    queryExpr: '${0}',
                    searchAttr: 'footprint',
                    title: 'Следы жизнедеятельности',
                    required: false,
                    style: 'width: 215px;'});
            },
            frequency: function () {
                return new TextBox({name: 'frequency', title: 'Частота встречаемости',
                    style: 'width: 215px;'});
            },
            habitat: function () {
                return new Textarea({name: 'habitat', title: 'Местообитание',
                    style: 'width: 215px;'});
            },
            vitality: function () {
                return new JsonFilteringSelect({
                    url: '/vitality_browse',
                    name: 'vitality',
                    queryExpr: '${0}',
                    searchAttr: 'vitality',
                    title: 'Состояние популяции',
                    required: false,
                    style: 'width: 215px;'});
            },
            unknown_age: function () {
                return new NumberTextBox({name: 'unknown_age', title: 'Возраст неопределен',
                    style: 'width: 215px;'});
            },
            unknown_sex: function () {
                return new NumberTextBox({name: 'unknown_sex', title: 'Пол неопределен',
                    style: 'width: 215px;'});
            },
            ad: function () {
                return new NumberTextBox({name: 'ad', title: 'Взрослые',
                    style: 'width: 215px;'});
            },
            sad: function () {
                return new NumberTextBox({name: 'sad', title: 'Предвзрослые',
                    style: 'width: 215px;'});
            },
            juv: function () {
                return new NumberTextBox({name: 'juv', title: 'Молодые',
                    style: 'width: 215px;'});
            },
            pull: function () {
                return new NumberTextBox({name: 'pull', title: 'Новорожденные',
                    style: 'width: 215px;'});
            },
            egs: function () {
                return new NumberTextBox({name: 'egs', title: 'Яйца',
                    style: 'width: 215px;'});
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
                    style: 'width: 215px;'});
            },
            lat: function () {
                return new NumberTextBox({name: 'lat', title: 'Широта',
                    style: 'width: 215px;'});
            },
            lon: function () {
                return new NumberTextBox({name: 'lon', title: 'Долгота',
                    style: 'width: 215px;'});
            },
            location: function () {
                return new Textarea({name: 'location', title: 'Геопривязка',
                    style: 'width: 215px;'});
            },
            limit_fact: function () {
                return new Textarea({name: 'limit_fact', title: 'Лимитирующие факторы',
                    style: 'width: 215px;'});
            },
            biotop: function () {
                return new TextBox({
                    name: 'biotop',
                    title: 'Биотоп',
                    style: 'width: 215px;'});
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
});