# Sistema de Gestão de Alunos

Case prático FIEP/SENAI: aplicação web para gerenciamento de alunos, com autenticação JWT, CRUD completo e proteção das rotas pelo Spring Security.

## 1. Descrição do projeto

O sistema permite que um usuário autenticado **cadastre, consulte, altere e exclua alunos**. O acesso é protegido por uma tela de login; sem token válido, nenhuma rota de alunos pode ser acessada.

Pontos principais:

- Backend em API REST, organizado em camadas: `Controller → Service → Repository → MySQL`.
- Autenticação **stateless com JWT**; a senha é armazenada somente como hash **BCrypt** e **nunca** é enviada ao frontend.
- Entidades JPA não são expostas: toda a comunicação usa **DTOs**.
- Tratamento global de erros com códigos HTTP adequados (400, 401, 404, 409).
- Frontend em Vue 3 com Vue Router (*route guard*) e Axios (*interceptor* que injeta o token).

Fluxo: `Vue.js → API REST → Spring Boot → Spring Security → Service → JPA → MySQL`

## 2. Tecnologias utilizadas

| Camada | Tecnologias |
|---|---|
| Backend | Java, Spring Boot 3.3.5, Spring Web, Spring Data JPA, Spring Security, Bean Validation, JJWT 0.12.6 |
| Banco de dados | MySQL 8+ |
| Frontend | Vue.js 3 (Composition API), Vite, Vue Router 4, Axios |

## 3. Requisitos para execução

- **JDK 17 ou superior em versão LTS (17 ou 21 recomendados).** O Spring Boot 3.3.5 não consegue iniciar com JDKs muito recentes (erro `Unsupported class file major version`). O valor de `java.version` está no `pom.xml`.
- **MySQL 8** (ou superior) em execução.
- **Node.js 20+** e **npm**.
- Maven não precisa estar instalado: o projeto inclui o Maven Wrapper (`mvnw` / `mvnw.cmd`).

## 4. Configuração do MySQL

O script `database/script.sql` cria o banco `sistema_alunos`, as tabelas `usuarios` e `alunos` e o usuário de teste.

Na raiz do projeto, execute:

```bash
mysql -u root -p -e "source database/script.sql"
```

Alternativa: abra o arquivo no MySQL Workbench e execute o script inteiro.

O backend lê a conexão do `backend/src/main/resources/application.properties`. Os valores padrão são:

| Variável de ambiente | Padrão |
|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/sistema_alunos?...` |
| `DB_USERNAME` | `root` |
| `DB_PASSWORD` | `root` |

Se a sua senha do MySQL for outra, defina `DB_PASSWORD` no ambiente ou altere o `application.properties`.

> O schema é criado apenas pelo script. O Hibernate está em `ddl-auto=validate`, ou seja, só confere se as tabelas batem com as entidades.

## 5. Como executar o backend

```bash
cd backend
./mvnw spring-boot:run          # Linux/macOS
.\mvnw.cmd spring-boot:run      # Windows (PowerShell)
```

A API sobe em `http://localhost:8080`.

Variáveis opcionais:

| Variável | Descrição | Padrão |
|---|---|---|
| `JWT_SECRET` | Segredo do JWT em Base64 (mínimo 256 bits) | valor de desenvolvimento no `application.properties` |
| `JWT_EXPIRATION_MS` | Validade do token em milissegundos | `7200000` (2 horas) |
| `CORS_ALLOWED_ORIGINS` | Origens liberadas (separadas por vírgula) | `http://localhost:5173` |

> **Produção:** defina sempre um `JWT_SECRET` próprio. O valor padrão existe apenas para desenvolvimento.

## 6. Como executar o frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`.

A URL da API é configurada em `frontend/.env`:

```
VITE_API_URL=http://localhost:8080
```

Telas:

| Rota | Tela | Acesso |
|---|---|---|
| `/login` | Login | público |
| `/alunos` | Dashboard (lista de alunos) | autenticado |
| `/alunos/novo` | Cadastro | autenticado |
| `/alunos/:id/editar` | Edição | autenticado |

Sem token válido, as rotas protegidas redirecionam para `/login`. Se o token expirar durante o uso, a próxima requisição volta para o login com um aviso.

## 7. Usuário para teste

| Campo | Valor |
|---|---|
| Usuário | `admin` |
| Senha | `123456` |

A senha está salva no banco como hash BCrypt (custo 12). Para criar outro usuário, gere o hash BCrypt da senha desejada e insira na tabela `usuarios`. **Troque essa credencial fora de ambiente de testes.**

## 8. Endpoints da API

Base URL: `http://localhost:8080`

### Autenticação

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| POST | `/api/auth/login` | Autentica e retorna o token JWT | público |

Requisição:

```json
{ "username": "admin", "password": "123456" }
```

Resposta `200`:

```json
{ "token": "eyJhbGciOi...", "tipo": "Bearer", "expiraEmMs": 7200000, "username": "admin" }
```

Credenciais inválidas retornam `401`.

### Alunos

Todas as rotas exigem o header `Authorization: Bearer <token>`. Sem ele, a resposta é `401`.

| Método | Rota | Descrição | Sucesso | Erros |
|---|---|---|---|---|
| GET | `/api/alunos` | Lista os alunos (ordem alfabética) | 200 | 401 |
| GET | `/api/alunos/{id}` | Busca por ID | 200 | 401, 404 |
| POST | `/api/alunos` | Cadastra aluno | 201 (+ header `Location`) | 400, 401, 409 |
| PUT | `/api/alunos/{id}` | Atualiza aluno | 200 | 400, 401, 404, 409 |
| DELETE | `/api/alunos/{id}` | Exclui aluno | 204 | 401, 404 |

Corpo do `POST` e do `PUT`:

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "cpf": "123.456.789-09",
  "curso": "Desenvolvimento de Sistemas",
  "idade": 20,
  "ativo": true
}
```

Resposta de aluno:

```json
{
  "id": 1,
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "cpf": "123.456.789-09",
  "curso": "Desenvolvimento de Sistemas",
  "idade": 20,
  "ativo": true,
  "dataCadastro": "2026-10-08T17:38:53"
}
```

### Regras de validação

| Campo | Regra |
|---|---|
| `nome` | Obrigatório, até 100 caracteres |
| `email` | Obrigatório, formato válido, até 150 caracteres, **único** (comparado em minúsculas) |
| `cpf` | Obrigatório, 11 dígitos (com ou sem pontuação), **único**; é salvo como `000.000.000-00` |
| `curso` | Obrigatório, até 100 caracteres |
| `idade` | Obrigatória, entre **16 e 100** anos |
| `ativo` | Obrigatório (`true` ou `false`) |
| `dataCadastro` | Preenchida automaticamente |

O CPF é validado apenas pelo formato; os dígitos verificadores não são conferidos.

### Formato de erro

```json
{
  "status": 400,
  "mensagem": "Dados inválidos",
  "detalhes": ["email: E-mail em formato inválido"],
  "timestamp": "2026-10-08T17:40:00"
}
```

| Status | Quando ocorre |
|---|---|
| 400 | Dados inválidos, JSON malformado, idade fora de 16–100 |
| 401 | Usuário ou senha inválidos, token ausente, inválido ou expirado |
| 404 | Aluno não encontrado |
| 409 | E-mail ou CPF já cadastrado |

### Exemplo rápido com curl

No PowerShell, use `curl.exe` (o `curl` é um alias de outro comando).

```bash
# 1. Login
curl.exe -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"123456\"}"

# 2. Sem token → 401
curl.exe -i http://localhost:8080/api/alunos

# 3. Com token → 200
curl.exe http://localhost:8080/api/alunos -H "Authorization: Bearer SEU_TOKEN"
```

## Estrutura do projeto

```
sistema-alunos/
├── database/
│   └── script.sql
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── resources/application.properties
│       └── java/br/org/senaipr/sistemaalunos/
│           ├── SistemaAlunosApplication.java
│           ├── controller/   AlunoController, AuthController
│           ├── service/      AlunoService, AuthService
│           ├── repository/   AlunoRepository, UsuarioRepository
│           ├── model/        Aluno, Usuario
│           ├── dto/          AlunoRequest, AlunoResponse, LoginRequest, LoginResponse, ErroResponse
│           ├── exception/    GlobalExceptionHandler e exceções de negócio
│           └── security/     SecurityConfig, JwtService, JwtAuthenticationFilter, UserDetailsServiceImpl
├── frontend/
│   ├── .env
│   └── src/
│       ├── main.js, App.vue, style.css
│       ├── router/       rotas e route guard
│       ├── auth/         gerenciamento do token
│       ├── services/     api.js (Axios + interceptors), authService, alunoService
│       ├── utils/        flash.js (mensagens entre telas)
│       └── views/        LoginView, AlunosListView, AlunoFormView
└── README.md
```

## Segurança

- Senhas armazenadas apenas com hash BCrypt; nenhum DTO de resposta contém `password`.
- CSRF desativado e sessão `STATELESS`, pois a autenticação é feita por token no header.
- `/api/alunos/**` e qualquer outra rota (exceto o login) exigem autenticação.
- Mensagens de erro do servidor não expõem stack trace nem detalhes internos.
- O token é guardado no `localStorage` do navegador, solução comum em projetos de estudo. Em produção, considere cookie `HttpOnly`.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `Unsupported class file major version` ao subir o backend | JDK mais novo do que o Spring Boot 3.3.5 suporta; use JDK 17 ou 21 |
| `Access denied for user` / falha de conexão ao subir o backend | Senha ou URL do MySQL incorretas; ajuste `DB_PASSWORD`/`DB_URL` |
| `Failed to resolve import "vue-router"` (ou `axios`) | Dependências não instaladas; rode `npm install` em `frontend/` |
| Erro de CORS no navegador | O frontend roda numa porta diferente de 5173; ajuste `CORS_ALLOWED_ORIGINS` |