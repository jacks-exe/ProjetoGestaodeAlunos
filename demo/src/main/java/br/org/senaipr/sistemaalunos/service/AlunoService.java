package br.org.senaipr.sistemaalunos.service;

import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.org.senaipr.sistemaalunos.dto.AlunoRequest;
import br.org.senaipr.sistemaalunos.dto.AlunoResponse;
import br.org.senaipr.sistemaalunos.exception.ConflitoException;
import br.org.senaipr.sistemaalunos.exception.RecursoNaoEncontradoException;
import br.org.senaipr.sistemaalunos.exception.RegraNegocioException;
import br.org.senaipr.sistemaalunos.model.Aluno;
import br.org.senaipr.sistemaalunos.repository.AlunoRepository;

@Service
public class AlunoService {

    private static final int IDADE_MINIMA = 16;
    private static final int IDADE_MAXIMA = 100;

    private final AlunoRepository alunoRepository;

    public AlunoService(AlunoRepository alunoRepository) {
        this.alunoRepository = alunoRepository;
    }

    @Transactional(readOnly = true)
    public List<AlunoResponse> listar() {
        return alunoRepository.findAll(Sort.by("nome")).stream()
                .map(AlunoResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public AlunoResponse buscarPorId(Long id) {
        return AlunoResponse.de(obterOuFalhar(id));
    }

    @Transactional
    public AlunoResponse criar(AlunoRequest request) {
        String email = normalizarEmail(request.email());
        String cpf = formatarCpf(request.cpf());

        validarIdade(request.idade());
        if (alunoRepository.existsByEmail(email)) {
            throw new ConflitoException("E-mail já cadastrado");
        }
        if (alunoRepository.existsByCpf(cpf)) {
            throw new ConflitoException("CPF já cadastrado");
        }

        Aluno aluno = new Aluno(request.nome().trim(), email, cpf,
                request.curso().trim(), request.idade(), request.ativo());
        return AlunoResponse.de(alunoRepository.save(aluno));
    }

    @Transactional
    public AlunoResponse atualizar(Long id, AlunoRequest request) {
        Aluno aluno = obterOuFalhar(id);
        String email = normalizarEmail(request.email());
        String cpf = formatarCpf(request.cpf());

        validarIdade(request.idade());
        if (alunoRepository.existsByEmailAndIdNot(email, id)) {
            throw new ConflitoException("E-mail já cadastrado");
        }
        if (alunoRepository.existsByCpfAndIdNot(cpf, id)) {
            throw new ConflitoException("CPF já cadastrado");
        }

        aluno.setNome(request.nome().trim());
        aluno.setEmail(email);
        aluno.setCpf(cpf);
        aluno.setCurso(request.curso().trim());
        aluno.setIdade(request.idade());
        aluno.setAtivo(request.ativo());
        return AlunoResponse.de(alunoRepository.save(aluno));
    }

    @Transactional
    public void excluir(Long id) {
        alunoRepository.delete(obterOuFalhar(id));
    }

    private Aluno obterOuFalhar(Long id) {
        return alunoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado"));
    }

    private void validarIdade(Integer idade) {
        if (idade < IDADE_MINIMA || idade > IDADE_MAXIMA) {
            throw new RegraNegocioException(
                    "A idade deve estar entre " + IDADE_MINIMA + " e " + IDADE_MAXIMA + " anos");
        }
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    /** Padroniza para 000.000.000-00, evitando que o mesmo CPF com/sem pontuação burle a unicidade. */
    private String formatarCpf(String cpf) {
        String d = cpf.replaceAll("\\D", "");
        return d.substring(0, 3) + "." + d.substring(3, 6) + "." + d.substring(6, 9) + "-" + d.substring(9);
    }
}