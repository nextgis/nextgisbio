<div class="user-data">
    %if is_auth:
        <button id="logoutButton" data-dojo-type="dijit/form/Button" type="button"
                onClick="location.href='${request.route_url('logout')}';">
            Выйти
        </button>
    %else:
        <button id="loginButton" data-dojo-type="dijit/form/Button" type="button" onClick="loginDialog.show();">
            Войти
        </button>
    %endif
</div>

<div data-dojo-type="dijit/Dialog" data-dojo-id="loginDialog" title="Вход">
    <form method="post" action="${request.route_url('login')}">
        <input type="hidden" value="1" name="form.submitted">
        <table class="dijitDialogPaneContentArea">
            <tr>
                <td><label for="login">Логин:</label></td>
                <td><input data-dojo-type="dijit/form/TextBox" name="login" id="login"></td>
            </tr>
            <tr>
                <td><label for="password">Пароль:</label></td>
                <td><input type="password" data-dojo-type="dijit/form/ValidationTextBox" name="password" id="password">
                </td>
            </tr>
        </table>
        <div class="dijitDialogPaneActionBar">
            <button data-dojo-type="dijit/form/Button" type="submit">Вход</button>
        </div>
    </form>
</div>