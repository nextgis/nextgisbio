define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/Dialog',
    'dojo/text!./templates/ConfirmDialog.html',
    'mustache/mustache'
], function (declare, array, lang, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, template, mustache) {
    return declare([Dialog], {
        title: "Confirm",
        message: "Are you sure?",

        constructor: function (kwArgs) {
            lang.mixin(this, kwArgs);

            var message = this.message;

            var contentWidget = new (declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
                templateString: template,
                message: message,
                _stringRepl: function (tmpl) {
                    return mustache.render(tmpl, this);
                }
            }));
            contentWidget.startup();
            this.content = contentWidget;
        },

        postCreate: function () {
            this.inherited(arguments);
            this.connect(this.content.cancelButton, "onClick", "onCancel");
        }
    });
});