package br.org.senaipr.sistemaalunos.exception;

/** Mapeada para HTTP 409 (e-mail ou CPF duplicado). */
public class ConflitoException extends RuntimeException {

    public ConflitoException(String mensagem) {
        super(mensagem);
    }
}