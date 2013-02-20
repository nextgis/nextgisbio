%if message:
    <div class="message">
        ${message | n}
    </div>
%endif

<form action="${url}" method="post">
    <input type="hidden" name="next" value="${next_url}"/>

    <p>
		<label>Логин:</label>
		<input type="text" name="login" value="${login}"/>
    </p>

    <p>
        <label>Пароль:</label>
        <input type="password" name="password"/>
    </p>

    <div class="buttons">
        <input type="submit" name="form.submitted" value="Войти" style="display: block; width: 7em; padding: 0.25ex;"/>
    </div>
</form>
