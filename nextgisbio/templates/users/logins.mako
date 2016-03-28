<%inherit file='../base/_row-2.mako'/>

<%block name="css">
    <link rel="stylesheet"
          href="${request.static_url('nextgisbio:static/js/lib/jquery-ui-1.11.4/jquery-ui.min.css')}"/>
    <link rel="stylesheet"
          href="${request.static_url('nextgisbio:static/js/lib/jTable/themes/lightcolor/gray/jtable.min.css')}"/>
</%block>

<%block name="content">
    <h1>${title}</h1>
    <div class="search-row">
        <label for="searchByName">ФИО</label>
        <input id="searchByName" type="text"/>
        <input type="button" name="Найти" value="Найти"/>
    </div>
    <div data-dojo-type="ngbio/users/UsersTable" id="usersTable"></div>
</%block>

<%block name="js">
    <script src="${request.static_url('nextgisbio:static/js/lib/jTable/jquery.jtable.js')}"
            type="text/javascript"></script>
    <script src="${request.static_url('nextgisbio:static/js/lib/jTable/localization/jquery.jtable.ru.js')}"
            type="text/javascript"></script>
</%block>
