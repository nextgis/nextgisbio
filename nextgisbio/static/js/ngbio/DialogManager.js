define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/on',
    'dojo/topic',
    'dijit/MenuBar',
    'dijit/PopupMenuBarItem',
    'dijit/Menu',
    'dijit/MenuItem',
    'dijit/DropDownMenu',
    'ngbio/Forms',
    'ngbio/Dialog',
    'dojo/domReady!'
], function (declare, array, on, topic, MenuBar, PopupMenuBarItem, Menu, MenuItem, DropDownMenu, Forms, Dialog) {
    topic.subscribe('open/form', function (type, formId, title, action, values, elementsSettings) {
        var formTemplate = Forms.forms[formId],
            listElementsId = formTemplate.elements,
            formElements = [],
            formElementsMap = {},
            elementName,
            mixedProperties = null;

        array.forEach(listElementsId, function (elementItemSetting) {
            if (typeof elementItemSetting === 'string') {
                elementName = elementItemSetting;
                mixedProperties = null;
            } else if (typeof elementItemSetting === 'object') {
                elementName = elementItemSetting.name;
                mixedProperties = elementItemSetting.props;
            }

            if (!Forms.elements[elementName]) {
                console.log(elementName + ' element not found');
            } else {
                var elementTemplate = Forms.elements[elementName],
                    element;
                if (typeof elementTemplate === 'function') {
                    element = elementTemplate.call(this, type, values);
                    if (values && values[elementName]) {
                        element.set('value', values[elementName]);
                    }
                    if (elementsSettings && elementsSettings[elementName]) {
                        declare.safeMixin(element, elementsSettings[elementName]);
                    }
                } else {
                    var params = [];
                    array.forEach(elementTemplate.params, function (paramName) {
                        if (paramName === 'props') {
                            params.push(mixedProperties);
                        } else {
                            params.push(formTemplate[paramName]);
                        }
                    });
                    element = elementTemplate.action.apply(undefined, params);
                    if (values && values[elementName]) {
                        element.set('value', values[elementName]);
                    }
                    if (elementsSettings && elementsSettings[elementName]) {
                        declare.safeMixin(element, elementsSettings[elementName]);
                    }
                }
                formElements.push(element);
                formElementsMap[elementName] = element;
            }
        });

        var formSettings = formTemplate['form'];
        if (action) {
            declare.safeMixin(formSettings, {action: action});
        }

        var dialogSettings = null;
        if (elementsSettings && elementsSettings['_dialog']) {
            dialogSettings = elementsSettings['_dialog'];
        }

        new Dialog({
            title: title,
            elements: formElements,
            elementsMap: formElementsMap,
            formSettings: formSettings,
            dialogSettings: dialogSettings
        }).show();
    });
});