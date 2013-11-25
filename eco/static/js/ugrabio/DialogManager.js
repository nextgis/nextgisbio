define([
    'dojo/_base/array',
    'dojo/on',
    'dojo/topic',
    'dijit/MenuBar',
    'dijit/PopupMenuBarItem',
    'dijit/Menu',
    'dijit/MenuItem',
    'dijit/DropDownMenu',
    'ugrabio/Forms',
    'ugrabio/Dialog',
    'dojo/domReady!'
], function (array, on, topic, MenuBar, PopupMenuBarItem, Menu, MenuItem, DropDownMenu, Forms, Dialog) {
    topic.subscribe('open/form', function (formId) {
        var formTemplate = Forms.forms[formId],
            listElementsId = formTemplate.elements,
            formElements = [];

        array.forEach(listElementsId, function (elementName) {
            if (!Forms.elements[elementName]) {
                console.log(elementName + ' element not found');
            } else {
                var elementTemplate = Forms.elements[elementName];

                if (typeof elementTemplate === 'function') {
                    formElements.push(elementTemplate());
                } else {
                    var params = [];
                    array.forEach(elementTemplate.params, function (paramName) {
                        params.push(formTemplate[paramName]);
                    });
                    formElements.push(elementTemplate.action.apply(undefined, params));
                }
            }

        });

        new Dialog({
            title: 'Создать новую карточку',
            elements: formElements,
            formSettings: formTemplate['form']
        }).show();
    });
});