define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dijit/form/ToggleButton'

], function (declare, array, lang, ToggleButton) {
    return declare([ToggleButton], {
        onChange: function (val) {
            if (!this._dialog) return false;

            var latTextBox = this._dialog.elementsMap['lat'],
                lonTextBox = this._dialog.elementsMap['lon'];


        }
    });
})