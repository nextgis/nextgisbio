define([
    'dijit/form/TextBox',
    'dijit/form/NumberTextBox',
    'dijit/form/Textarea',
    'dijit/form/CheckBox',
    'ugrabio/JsonFilteringSelect'
], function (TextBox, NumberTextBox, Textarea, CheckBox, JsonFilteringSelect) {

    var getPersonJsonFilteringSelect = function (title, name) {
        return new JsonFilteringSelect({
            url: '/person_name',
            name: name,
            title: title
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
                {label: 'Птицы', action: ''},
                {label: 'Рептилии, амфибии, рыбы', action: ''},
                {label: 'Членистоногие', action: ''},
                {label: 'Мхи', action: ''},
                {label: 'Сосудистые растения', action: ''},
                {label: 'Грибы, лишайники', action: ''},
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
                type: 'mammalia',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'anthr_press', 'vitality', 'habitat', 'footprint', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'unknown_sex', 'males', 'females', 'unknown_age', 'ad', 'sad', 'juv', 'pull']},
            'cardAves': {
                type: 'aves',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'anthr_press', 'vitality', 'footprint', 'habitat', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'unknown_sex', 'males', 'females', 'unknown_age', 'ad', 'sad', 'juv', 'pull', 'egs']},
            'cardAra': {
                type: 'ara',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'anthr_press', 'vitality', 'habitat', 'footprint', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'unknown_sex', 'males', 'females', 'unknown_age', 'ad', 'sad', 'juv', 'pull', 'egs']},
            'cardArthropoda': {
                type: 'arthropoda',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'substrat', 'anthr_press', 'vitality', 'habitat', 'footprint', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'unknown_sex', 'males', 'females', 'unknown_age', 'ad', 'sad', 'juv', 'pull', 'egs']},
            'cardMoss': {
                type: 'moss',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'anthr_press', 'vitality', 'habitat', 'substrat', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'abundance', 'area']},
            'cardPlantae': {
                type: 'plantae',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'substrat', 'anthr_press', 'vitality', 'habitat', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'abundance', 'area']},
            'cardLichenes': {
                type: 'lichenes',
                elements: ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'museum', 'location', 'lat', 'lon', 'coord_type', 'year', 'month', 'day', 'time', 'photo', 'anthr_press', 'vitality', 'habitat', 'substrat', 'limit_fact', 'protection', 'notes', 'inforesources', 'publications', 'pheno', 'quantity', 'abundance', 'area']},
            'anMammalia': {
                elements: ['inserter']
            }
        },

        elements: {
            id: function () {
                return new TextBox({name: 'id', type: 'hidden'})
            },
            species: {
                params: ['type'],
                action: function (type) {
                    return new JsonFilteringSelect({
                        url: '/species/' + type + '/',
                        name: 'species',
                        title: 'Лат. название'});
                }
            },
            original_name: function () {
                return new TextBox({name: 'original_name', title: 'Исходное название', readOnly: true});
            },
            inserter: function () {
                return getPersonJsonFilteringSelect('Вносил', 'inserter');
            },
            observer: function () {
                return getPersonJsonFilteringSelect('Наблюдал', 'observer');
            },
            identifier: function () {
                return getPersonJsonFilteringSelect('Определил', 'identifier');
            },
            collecter: function () {
                return getPersonJsonFilteringSelect('Собрал', 'collecter');
            },
            museum: function () {
                return new JsonFilteringSelect({
                    url: '/museum_browse',
                    name: 'museum',
                    searchAttr: 'museum',
                    title: 'Музейные образцы'});
            },
            notes: function () {
                return new Textarea({name: 'notes', title: 'Примечания'});
            },
            pheno: function () {
                return new JsonFilteringSelect({
                    url: '/pheno_browse',
                    name: 'pheno',
                    title: 'Фаза жизненного цикла'});
            },
            photo: function () {
                return new CheckBox({name: 'photo', title: 'Фото'});
            },
            protection: function () {
                return new Textarea({name: 'protection', title: 'Меры защиты'});
            },
            publications: function () {
                return new Textarea({name: 'publications', title: 'Публикации'});
            },
            quantity: function () {
                return new NumberTextBox({name: 'quantity', title: 'Количество'});
            },
            substrat: function () {
                return new TextBox({name: 'substrat', title: 'Субстрат'});
            },
            status: function () {
                return new TextBox({name: 'status', title: 'Статус'});
            },
            time: function () {
                return new NumberTextBox({name: 'time', title: 'Время'});
            },
            vitality: function () {
                return new JsonFilteringSelect({
                    url: '/vitality_browse',
                    name: 'museum',
                    title: 'Состояние популяции'});
            },
            unknown_age: function () {
                return new NumberTextBox({name: 'unknown_age', title: 'Возраст неопределен'});
            },
            unknown_sex: function () {
                return new NumberTextBox({name: 'unknown_sex', title: 'Пол неопределен'});
            },
            year: function () {
                return new NumberTextBox({name: 'year', title: 'Год'});
            },
            ad: function () {
                return new NumberTextBox({name: 'ad', title: 'Взрослые'});
            },
            sad: function () {
                return new NumberTextBox({name: 'sad', title: 'Предвзрослые'});
            },
            juv: function () {
                return new NumberTextBox({name: 'juv', title: 'Молодые'});
            },
            pull: function () {
                return new NumberTextBox({name: 'pull', title: 'Новорожденные'});
            },
            egs: function () {
                return new NumberTextBox({name: 'egs', title: 'Яйца'});
            }
        }
    };
});