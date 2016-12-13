define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/on',
    'dijit/_Widget',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/Dialog',
    'dojo/text!./UploadFileDialog.mustache',
    'mustache/mustache'
], function (declare, array, lang, on, _Widget, _WidgetBase,
             _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, template, mustache) {
    return declare([Dialog], {
        title: 'Загрузить полигон',

        constructor: function (kwArgs) {
            lang.mixin(this, kwArgs);

            var contentWidget = new (declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
                templateString: template,
                _skipNodeCache: true,
                _stringRepl: function (tmpl) {
                    return mustache.render(tmpl, this);
                }
            }));

            contentWidget.startup();

            on(this, 'hide', lang.hitch(this, function () {
                this.destroy();
            }));

            this.content = contentWidget;
        },

        postCreate: function () {
            this.inherited(arguments);
            this.content.submitButton.setDisabled(true);
            this.connect(this.content.cancelButton, 'onClick', 'onCancel');

            $('#UploadPolygonInput').change(lang.hitch(this, function (e) {
                var file = e.target.files[0];
                if (file) {
                    this.content.submitButton.setDisabled(false);
                } else {
                    this.content.submitButton.setDisabled(true);
                }
            }));

            on(this.content.submitButton, 'click', lang.hitch(this, function () {
                var file = $('#UploadPolygonInput')[0].files[0];
                if (file && this.onSubmit) {
                    this.onSubmit.call(this, file);
                }
                this.hide();
            }));
        }
    });
});