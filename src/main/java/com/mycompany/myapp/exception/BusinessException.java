package com.mycompany.myapp.exception;

public class BusinessException extends RuntimeException {

    public BusinessException() {
        this("Ошибка бизнес-логики");
    }

    public BusinessException(String message) {
        super(message);
    }
}
