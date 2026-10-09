-- =============================================================
-- Sistema de Gestão de Alunos - FIEP/SENAI
-- Script de criação do banco de dados (MySQL 8+)
-- =============================================================

CREATE DATABASE IF NOT EXISTS sistema_alunos
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE sistema_alunos;

-- -------------------------------------------------------------
-- Tabela: usuarios
-- Armazena os usuários com acesso à aplicação.
-- A coluna password guarda SOMENTE o hash BCrypt (60 caracteres).
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id       BIGINT       NOT NULL AUTO_INCREMENT,
    username VARCHAR(50)  NOT NULL,
    password VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_usuarios_username UNIQUE (username)
) ENGINE = InnoDB;

-- -------------------------------------------------------------
-- Tabela: alunos
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alunos (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    nome          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL,
    cpf           VARCHAR(14)  NOT NULL,
    curso         VARCHAR(100) NOT NULL,
    idade         INT          NOT NULL,
    ativo         BOOLEAN      NOT NULL DEFAULT TRUE,
    data_cadastro DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_alunos_email UNIQUE (email),
    CONSTRAINT uk_alunos_cpf   UNIQUE (cpf),
    CONSTRAINT ck_alunos_idade CHECK (idade BETWEEN 16 AND 100)
) ENGINE = InnoDB;

-- -------------------------------------------------------------
-- Usuário de teste
--   username: admin
--   senha:    123456
-- Hash BCrypt (custo 12) gerado e validado para a senha acima.
-- O Spring Security (BCryptPasswordEncoder) aceita o prefixo $2b$.
-- -------------------------------------------------------------
INSERT INTO usuarios (username, password)
VALUES ('admin', '$2b$12$ohs7dqEn0ftyrT6vu0uumO97P7V3k5m9TOiEz.XUmf3i88tcsRUda')
ON DUPLICATE KEY UPDATE username = username;