define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/query',
    'dojo/dom-style',
    'dojo/on',
    'dojo/request/xhr',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/Dialog',
    'mustache/mustache',
    'dropzone/dropzone',
    'jssor/jssor',
    'jssor/jssor.slider',
    'dojo/text!./templates/PhotoGallery.html',
    'dojo/text!./templates/PhotoGalleryPhotos.html'
], function (declare, array, lang, html, query, domStyle, on, xhr, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, mustache, dropzone, jssor, jssorSlider, templatePhotoGallery, templateImages) {
    return declare('PhotoGallery', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: false,
        _skipNodeCache: true,
        templateString: templatePhotoGallery,
        constructor: function (kwArgs) {
            this.auth = window.ugrabio.is_auth;
            lang.mixin(this, kwArgs);
        },

        _stringRepl: function (tmpl) {
            return mustache.render(tmpl, this);
        },

        postCreate: function () {
            this.inherited(arguments);

            var isNewForm = this.obj ? false : true;
            if (isNewForm) {
                this._hideStatus();
                var domLinkAddPhoto = query('a.add-photo', this.domNode)[0];
                html.setStyle(domLinkAddPhoto, 'color', 'gray');
                on(domLinkAddPhoto, 'click', lang.hitch(this, function (e) {
                    var dialog = new Dialog({
                        title: 'Добавить фотографии',
                        content: 'Для добавления фотографий необходимо создать карточку',
                        hide: function () {
                            dialog.destroy();
                        }
                    });
                    dialog.show();
                }));
                return false;
            } else {
                this._fetchImagesFromServer();
                this._bindEvents();
            }
        },

        _fetchImagesFromServer: function () {
            var countImages;
            xhr.get(application_root + '/' + this.type + '/' + this.obj.id + '/images', {
                handleAs: 'json'
            })
                .then(lang.hitch(this, function (data) {
                    countImages = data.length;
                    if (countImages > 0) {
                        this._hideStatus();
                    } else {
                        if (this.auth) {
                            this._hideStatus();
                        } else {
                            this._showStatus('Фотографий нет');
                        }
                    }
                    this._buildImagesSection(data);
                }), lang.hitch(this, function (error) {
                    this._showStatus('Ошибка получения фотографий!');
                }));
        },

        _buildImagesSection: function (images) {
            query('div.images', this.domNode)[0].innerHTML = mustache.render(templateImages, {images: images});
        },

        _bindEvents: function () {
            if (this.auth) {
                on(query('a.add-photo', this.domNode)[0], 'click', lang.hitch(this, function (e) {
                    this._showDropzoneDialog(this._getExistingImages());
                }));
            }
        },

        _getExistingImages: function () {
            var domImages = query('div.images img', this.domNode),
                imagesParsed = null,
                imageParsed;

            array.forEach(domImages, function (domImage) {
                if (imagesParsed === null) {
                    imagesParsed = [];
                }
                imageParsed = {
                    name: html.getAttr(domImage, 'title'),
                    url: html.getAttr(domImage, 'src'),
                    id: html.getAttr(domImage, 'data-id'),
                    size: html.getAttr(domImage, 'data-size'),
                    type: this.type
                };
                imagesParsed.push(imageParsed);
            }, this);

            return imagesParsed;
        },

        _dropzone: null,
        _changedDropzone: false,
        _showDropzoneDialog: function (existingImages) {
            var dropzoneDialog;

            this._changedDropzone = false;

            dropzoneDialog = new Dialog({
                title: 'Добавить фотографии',
                content: '<div class="dropzone-dialog"></div>',
                style: 'width: 80%; height: 80%;',
                class: 'dropzone-dialog',
                hide: lang.hitch(this, function () {
                    dropzoneDialog.destroy();
                    if (this._changedDropzone) {
                        this._fetchImagesFromServer();
                    }
                })
            });

            dropzoneDialog.show();

            domStyle.set(dropzoneDialog.containerNode, {
                width: '100%',
                height: '100%'
            });

            this._buildDropzone(dropzoneDialog.containerNode, existingImages);
        },

        _buildDropzone: function (dialogDomNode, existingImages) {
            html.addClass(dialogDomNode, 'dropzone');
            this._dropzone = new dropzone(dialogDomNode, {
                addRemoveLinks: true,
                url: application_root + '/images/upload/' + this.type + '/' + this.obj.id,
                removedfile: lang.hitch(this, this._removeDropzoneFile),
                dictRemoveFile: 'Удалить'
            });

            array.forEach(existingImages, function (exisitngImage) {
                this._dropzone.options.addedfile.call(this._dropzone, exisitngImage);
                this._dropzone.options.thumbnail.call(this._dropzone, exisitngImage, exisitngImage.url);
            }, this);

            this._bindDropzoneEvents();
        },


        _bindDropzoneEvents: function () {
            this._dropzone.on("success", lang.hitch(this, function (dropzoneFile, insertedFile) {
                lang.mixin(dropzoneFile, insertedFile);
                this._changedDropzone = true;
            }));
        },

        _removeDropzoneFile: function (file) {
            var _ref;

            xhr(application_root + '/images/remove/' + this.type + '/' + file.id, {
                handleAs: 'json'
            }).then(lang.hitch(this, function (response) {
                this._changedDropzone = true;
                return (_ref = file.previewElement) != null ? _ref.parentNode.removeChild(file.previewElement) : void 0;
            }));
        },

        _showStatus: function (textStatus) {
            html.addClass(this.domNode, 'status');
            query('span.status', this.domNode)[0].innerHTML = textStatus;
        },

        _hideStatus: function () {
            html.removeClass(this.domNode, 'status');
        }
    });
});