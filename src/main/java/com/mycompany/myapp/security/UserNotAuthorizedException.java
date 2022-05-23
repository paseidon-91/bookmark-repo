package com.mycompany.myapp.security;

public class UserNotAuthorizedException extends RuntimeException {

    public UserNotAuthorizedException() {
        super("Пользователь не авторизован");
    }
}
