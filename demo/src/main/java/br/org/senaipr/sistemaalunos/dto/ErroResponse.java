package br.org.senaipr.sistemaalunos.dto;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErroResponse(int status, String mensagem, List<String> detalhes, LocalDateTime timestamp) {

    public static ErroResponse de(HttpStatus status, String mensagem) {
        return new ErroResponse(status.value(), mensagem, null, LocalDateTime.now());
    }

    public static ErroResponse de(HttpStatus status, String mensagem, List<String> detalhes) {
        return new ErroResponse(status.value(), mensagem, detalhes, LocalDateTime.now());
    }
}