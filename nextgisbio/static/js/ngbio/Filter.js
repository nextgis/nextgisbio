define([
        'dojo/_base/declare',
        'ngbio/QueryString'
    ], function (declare, QueryString) {

        var _filter = null;

        var FilterSingleton = declare(null, {
            constructor: function () {
                var parameters = (new QueryString).getParameters();

                if (_filter) {
                    return _filter;
                } else {
                    _filter = {}
                }

                if (parameters['red_book']) {
                    _filter.red_book = parseInt(parameters['red_book'], 10);
                }
            },

            getFilter: function () {
                return _filter;
            },

            getAsQueryString: function () {
                var filterParameters = [];

                for (var parameterName in _filter) {
                    if (_filter.hasOwnProperty(parameterName)) {
                        filterParameters.push(parameterName + '=' + _filter[parameterName]);
                    }
                }

                return filterParameters.join('&');
            }
        });

        if (!_instance) {
            var _instance = new FilterSingleton();
        }

        return _instance;
    }
);