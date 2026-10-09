package br.org.senaipr.sistemaalunos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Dados de entrada para cadastro e edição de aluno. A regra de idade (16-100) fica no Service. */
public record AlunoRequest(

        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
        String nome,

        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "E-mail em formato inválido")
        @Size(max = 150, message = "O e-mail deve ter no máximo 150 caracteres")
        String email,

        @NotBlank(message = "O CPF é obrigatório")
        @Pattern(regexp = "^\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}$",
                message = "CPF deve ter 11 dígitos (com ou sem pontuação)")
        String cpf,

        @NotBlank(message = "O curso é obrigatório")
        @Size(max = 100, message = "O curso deve ter no máximo 100 caracteres")
        String curso,

        @NotNull(message = "A idade é obrigatória")
        Integer idade,

        @NotNull(message = "O campo ativo é obrigatório")
        Boolean ativo) {
}