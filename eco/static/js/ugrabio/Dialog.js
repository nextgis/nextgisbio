define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/Dialog',
    'digit/Form'
], function (declare, array, lang, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, Form) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

        constructor: function (options) {
            declare.safeMixin(this, options);

            if (this.elements) {
                this._buildForm(this.elements);
            } else {
                throw ReferenceError;
            }

            this._dialog = new Dialog({
                title: this._title,
                content: this._form,
                class: "non-modal"
            });
        },

        _buildForm: function (elements) {
            this._form = new Form();

            array.forEach(elements, lang.hitch(this, function (element) {
                element.placeAt(this._form.containerNode);
            }));
        },


        show: function () {
            this.inherited(arguments);
            this._dialog.show();
        }
    });
});