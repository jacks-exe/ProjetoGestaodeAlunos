package br.org.senaipr.sistemaalunos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.org.senaipr.sistemaalunos.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);
}