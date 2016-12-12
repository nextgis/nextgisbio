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
                    <label for="taxon__name__text__like">Название вида</label>
                    <input data-filter-item id="taxon__name__text__like" type="text"/>
                </div>
                <div class="filter-row">
                    <label for="cards__inserter__int__equal">Вносил</label>
                    <select data-filter-item id="cards__inserter__int__equal">
                        <option value=""></option>
                        % for person in persons:
                            <option value="${person.id}">${person.name}</option>
                        % endfor
                    </select>
                </div>
                <div class="filter-row">
                    <label for="cards__observer__int__equal">Наблюдал</label>
                    <select data-filter-item id="cards__observer__int__equal">
                        <option value=""></option>
                        % for person in persons:
                            <option value="${person.id}">${person.name}</option>
                        % endfor
                    </select>
                </div>
                <div class="filter-row">
                    <label for="cards__added_date">Дата внесения</label>
                    <input data-filter-item data-datepicker id="cards__added_date__date__from" type="text"/> &mdash;
                    <input data-filter-item data-datepicker id="cards__added_date__date__to" type="text"/>
                </div>
                <div class="filter-row">
                    <label for="cards__observed_date">Дата наблюдения</label>
                    <input data-filter-item data-datepicker id="cards__observed_date__date__from" type="text"/> &mdash;
                    <input data-filter-item data-datepicker id="cards__observed_date__date__to" type="text"/>
                </div>
                <div class="filter-row">
                    <input id="search" type="button" class="dojo-button" name="Найти" value="Фильтровать"/>
                </div>
            </fieldset>
        </form>
    </div>
    <div data-dojo-type="ngbio/cards/CardsTable" id="cardsTable"></div>
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
