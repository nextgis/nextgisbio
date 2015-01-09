define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dijit/form/ToggleButton'
], function (declare, array, lang, ToggleButton) {
    return declare([ToggleButton], {
        onChange: function (value) {
            if (!this._dialog) return false;
            var Map = window.ngbio.map;

            var latTextBox = this._dialog.elementsMap['lat'],
                lonTextBox = this._dialog.elementsMap['lon'];

            if (value) {
                try {
                    Map.coordinatesPickerOn(this.id, function (point) {
                        latTextBox.set('value', point.y);
                        lonTextBox.set('value', point.x);
                    }, lonTextBox.get('value'), latTextBox.get('value'));

                    latTextBox.set('disabled', true);
                    lonTextBox.set('disabled', true);
                } catch (err) {
                    alert('Режим получения координат включен для другого окна. Отключите его или закройте окно.');
                    this.setChecked(false);
                }

            } else {
                latTextBox.set('disabled', false);
                lonTextBox.set('disabled', false);
                Map.coordinatesPickerOff(this.id);
            }
        },

        destroy: function () {
            this.inherited(arguments);
            window.ngbio.map.coordinatesPickerOff(this.id);
        }
    });
})