package com.boatsafaritrip.backend.service;

public class PaymentNotFoundException extends RuntimeException{
    public PaymentNotFoundException(String message){
        super(message);
    }
}
