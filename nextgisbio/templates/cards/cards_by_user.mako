<%inherit file='../base/_row-2.mako'/>

<%block name="css">
    <link rel="stylesheet"
          href="${request.static_url('nextgisbio:static/js/lib/jquery-validation-engine/css/validationEngine.jquery.css')}"/>
    <link rel="stylesheet"
          href="${request.static_url('nextgisbio:static/js/lib/jquery-ui-1.11.4/jquery-ui.min.css')}"/>
    <link rel="stylesheet"
          href="${request.static_url('nextgisbio:static/js/lib/jTable/themes/lightcolor/gray/jtable.min.css')}"/>
</%block>

<%block name="content">
    <h1>${title}</h1>
    <div class="filter-form">
        <form id="formFilter">
            <fieldset>
                <legend>Фильтр</legend>
                <div class="filter-row">
                    <label for="inserter__name__text__like">Пользователь</label>
                    <input data-filter-item id="inserter__name__text__like" type="text"/>
                </div>
                <div class="filter-row">
                    <label for="years">Год</label>
                    <select data-filter-item id="years">
                        % for year in years:
                            <option value="${year}">${year}</option>
                        % endfor
                    </select>
                </div>
                <div class="filter-row">
                    <input id="search" type="button" class="dojo-button" name="Найти" value="Фильтровать"/>
                </div>
            </fieldset>
        </form>
    </div>
    <div data-dojo-type="ngbio/cards/CardsByUserTable" id="cardsTable"></div>
</%block>

<%block name="js">
    <script src="${request.static_url('nextgisbio:static/js/lib/jquery-validation-engine/jquery.validationEngine.js')}"
            type="text/javascript"></script>
    <script src="${request.static_url('nextgisbio:static/js/lib/jquery-validation-engine/jquery.validationEngine-ru.js')}"
            type="text/javascript"></script>
    <script src="${request.static_url('nextgisbio:static/js/lib/jTable/jquery.jtable.js')}"
            type="text/javascript"></script>
    <script src="${request.static_url('nextgisbio:static/js/lib/jTable/localization/jquery.jtable.ru.js')}"
            type="text/javascript"></script>
</%block>
