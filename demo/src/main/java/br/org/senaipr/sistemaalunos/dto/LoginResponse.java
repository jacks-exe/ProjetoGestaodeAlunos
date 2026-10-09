package br.org.senaipr.sistemaalunos.dto;

/** Resposta do login. Nunca contém a senha. */
public record LoginResponse(String token, String tipo, long expiraEmMs, String username) {
}