define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/Dialog',
    'dijit/form/Form',
    'dojox/layout/TableContainer'
], function (declare, array, lang, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, Form, TableContainer) {

    return declare([_WidgetBase], {

        constructor: function (options) {
            declare.safeMixin(this, options);

            if (this.elements) {
                this._buildForm(this.elements);
            } else {
                throw ReferenceError;
            }

            this._dialog = new Dialog({
                title: this.title,
                content: this._form,
                style: 'max-height:300px; overflow-y:scroll;',
                class: "non-modal"
            });
        },

        _buildForm: function (elements) {
            this._form = new Form();

            this._layout = new TableContainer({
                showLabels: true,
                orientation: 'horiz'
            });

            array.forEach(elements, lang.hitch(this, function (element) {
                this._layout.addChild(element);
            }));

            this._layout.placeAt(this._form.containerNode);
            this._layout.startup();
        },


        show: function () {
            this.inherited(arguments);
            this._form.startup();
            this._dialog.show();
        }
    });
});