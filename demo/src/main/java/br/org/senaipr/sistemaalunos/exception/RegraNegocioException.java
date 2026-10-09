package br.org.senaipr.sistemaalunos.exception;

/** Mapeada para HTTP 400 (ex.: idade fora do intervalo permitido). */
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}