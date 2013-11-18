require([
    'dijit/MenuBar',
    'dijit/PopupMenuBarItem',
    'dijit/Menu',
    'dijit/MenuItem',
    'dijit/DropDownMenu',
    'dojo/_base/array',
    'dojo/domReady!'
], function(MenuBar, PopupMenuBarItem, Menu, MenuItem, DropDownMenu, array){

    var menuList = {
        'Аннотированные списки': [
            'Млекопитающие',
            'Птицы',
            'Рептилии, амфибии, рыбы',
            'Членистоногие',
            'Мхи',
            'Сосудистые растения',
            'Грибы, лишайники',
            'Экспорт в csv'
        ],
        'Карточки наблюдений': [
            'Млекопитающие',
            'Птицы',
            'Рептилии, амфибии, рыбы',
            'Членистоногие',
            'Мхи',
            'Сосудистые растения',
            'Грибы, лишайники',
            'Экспорт в csv',
            'Экспорт в shp'
        ],
        'Контурный ареал': [
            'Экспорт в shp'
        ],
        'Экспорт': [
            'abundance',
            'annotation',
            'anthr_press',
            'area_type',
            'cards',
            'coord_type',
            'footprint',
            'inforesources',
            'key_area',
            'legend',
            'museum',
            'person',
            'pheno',
            'square_karea_association',
            'synonym',
            'taxa_scheme',
            'taxon',
            'user',
            'vitality'
        ]
    };

    var menuBar = new MenuBar({});

    for (var menu in menuList) {
        if (menuList.hasOwnProperty(menu)) {
            var subMenu = new DropDownMenu({});
            array.forEach(menuList[menu], function (menuItem, i) {
                subMenu.addChild(new MenuItem({
                    'label': menuItem
                }));
            });
            menuBar.addChild(new PopupMenuBarItem({
                label: menu,
                popup: subMenu
            }));
        }
    }

    menuBar.placeAt('menu');
    menuBar.startup();
});