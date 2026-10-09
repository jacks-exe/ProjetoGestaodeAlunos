package br.org.senaipr.sistemaalunos.dto;

import java.time.LocalDateTime;

import br.org.senaipr.sistemaalunos.model.Aluno;

public record AlunoResponse(
        Long id,
        String nome,
        String email,
        String cpf,
        String curso,
        Integer idade,
        Boolean ativo,
        LocalDateTime dataCadastro) {

    public static AlunoResponse de(Aluno aluno) {
        return new AlunoResponse(
                aluno.getId(),
                aluno.getNome(),
                aluno.getEmail(),
                aluno.getCpf(),
                aluno.getCurso(),
                aluno.getIdade(),
                aluno.getAtivo(),
                aluno.getDataCadastro());
    }
}