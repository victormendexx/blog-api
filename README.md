# Blog API — Tech Challenge Fase 2

![CI/CD](https://github.com/victormendexx/blog-api/actions/workflows/ci-cd.yml/badge.svg)

API REST para uma plataforma de blogging educacional, permitindo que professores publiquem
conteúdo e alunos consultem e pesquisem posts. Desenvolvida como parte do Tech Challenge da
Fase 2 da pós-graduação em Full Stack Development (FIAP).

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Arquitetura](#arquitetura)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Como rodar localmente](#como-rodar-localmente)
- [Como rodar com Docker](#como-rodar-com-docker)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Referência da API](#referência-da-api)
- [Testes](#testes)
- [CI/CD](#cicd)
- [Desafios e aprendizados](#desafios-e-aprendizados)

## Sobre o projeto

A maioria dos professores da rede pública não tem uma plataforma centralizada para publicar
aulas e conteúdo. Este projeto refatora o back-end de uma aplicação de blogging (antes construída
em OutSystems) para uma API REST em Node.js, capaz de escalar para um público nacional.

## Arquitetura

A API segue uma arquitetura em camadas, onde cada camada só conhece a camada imediatamente
abaixo dela:

```
Requisição HTTP
      │
      ▼
   routes/          define os endpoints e aplica middlewares (validação)
      │
      ▼
 controllers/       traduz HTTP (req/res) em chamadas à camada de serviço
      │
      ▼
  services/          regra de negócio, acesso ao banco via Mongoose
      │
      ▼
   models/           schema do Mongoose (estrutura dos documentos no MongoDB)
```

**Tratamento de erros centralizado:** em vez de `try/catch` repetido em cada controller, os
controllers são envolvidos por um `asyncHandler`, que encaminha qualquer erro assíncrono para um
middleware de erro único (`errorHandler`). Erros esperados (ex: "post não encontrado") são
lançados como `AppError`, que carrega o status HTTP correto; erros inesperados caem em um 500
genérico, sem vazar detalhes internos para o cliente.

**Validação de entrada:** os corpos das requisições `POST`/`PUT` são validados com
[Zod](https://zod.dev) antes de chegar ao controller, via um middleware `validate(schema)`.
Isso garante que a camada de negócio nunca recebe dado malformado.

**Formato de resposta:** todas as respostas seguem um envelope padronizado:

```json
{ "success": true, "data": { /* ... */ } }
```
```json
{ "success": false, "error": "mensagem descrevendo o problema" }
```

## Tecnologias utilizadas

- **Node.js** + **Express** — servidor HTTP e roteamento
- **TypeScript** — tipagem estática
- **MongoDB** + **Mongoose** — persistência de dados
- **Zod** — validação de esquemas de entrada
- **Jest** + **Supertest** + **mongodb-memory-server** — testes automatizados
- **Docker** + **Docker Compose** — containerização
- **GitHub Actions** — CI/CD
- **ESLint** + **Prettier** — qualidade e formatação de código

## Estrutura de pastas

```
src/
├── config/         # conexão com o banco de dados
├── controllers/    # camada HTTP (req/res)
├── models/         # schemas do Mongoose (Post, Teacher, Student)
├── routes/         # definição dos endpoints REST
├── services/       # regras de negócio e acesso ao banco
├── middlewares/     # validação, tratamento de erros, 404
├── utils/          # AppError, asyncHandler, jwt, paginação
├── validations/     # schemas Zod
├── app.ts          # instância do Express
└── server.ts       # ponto de entrada
tests/               # testes unitários e de integração (Jest + Supertest)
```

## Como rodar localmente

Pré-requisito: Node.js 20+. **Não é preciso Docker nem instalar o MongoDB**: o comando
`npm run db` sobe um MongoDB local usando o binário oficial baixado pelo `mongodb-memory-server`
(o mesmo usado nos testes), com os dados gravados em `.mongo-data/` — eles continuam lá depois de
parar e subir de novo.

1. Instale as dependências e crie o `.env`:

   ```bash
   npm install
   ```

   ```bash
   cp .env.example .env
   ```

2. **Terminal 1** — suba o MongoDB local e deixe aberto (na primeira vez ele baixa o binário do
   MongoDB, ~100 MB):

   ```bash
   npm run db
   ```

3. **Terminal 2** — crie o professor inicial (só na primeira vez) e suba a API:

   ```bash
   npm run seed
   ```

   ```bash
   npm run dev
   ```

O servidor sobe em `http://localhost:3000`. Verifique com:

```bash
curl http://localhost:3000/health
```

Login do professor inicial: os valores de `TEACHER_EMAIL` e `TEACHER_PASSWORD` do `.env`.

> Já tem um MongoDB (instalado, em container ou no Atlas)? Pule o passo 2 e ajuste `MONGODB_URI`
> no `.env`. Se o MongoDB não estiver acessível, o `npm run dev` encerra em 5 segundos com uma
> mensagem explicando o problema.

## Como rodar com Docker

```bash
docker compose up --build
```

Isso sobe a API (porta 3000) e um container MongoDB juntos, já conectados entre si.

```bash
docker compose down       # para os containers, mantém os dados
docker compose down -v    # para os containers e apaga os dados do Mongo
```

## Variáveis de ambiente

| Variável       | Descrição                              | Exemplo                                  |
|----------------|-----------------------------------------|-------------------------------------------|
| `PORT`         | Porta em que a API escuta               | `3000`                                    |
| `NODE_ENV`     | Ambiente de execução                    | `development` / `production`              |
| `MONGODB_URI`  | String de conexão com o MongoDB         | `mongodb://localhost:27017/blog-api`       |
| `JWT_SECRET`   | Segredo usado para assinar os tokens    | string longa e aleatória                  |
| `JWT_EXPIRES_IN` | Validade do token                     | `8h`                                      |
| `TEACHER_NAME` / `TEACHER_EMAIL` / `TEACHER_PASSWORD` | Professor inicial criado por `npm run seed` | `professor@escola.com` |

## Referência da API

Só o login é público. Todas as demais rotas exigem o header `Authorization: Bearer <token>`,
obtido em `POST /auth/login`, e o token carrega o perfil de quem entrou (`teacher` ou `student`):

- sem token, ou com token inválido/expirado → `401`;
- aluno tentando uma rota só de professor → `403`.

| Recurso | Método e rota | Quem acessa |
|---|---|---|
| Autenticação | `POST /auth/login` | público |
| Posts | `GET /posts`, `GET /posts/:id`, `GET /posts/search?q=` | professor ou aluno |
| Posts | `POST /posts`, `PUT /posts/:id`, `DELETE /posts/:id` | professor |
| Professores | `GET /teachers?page=&limit=`, `GET /teachers/:id`, `POST`, `PUT /:id`, `DELETE /:id` | professor |
| Alunos | `GET /students?page=&limit=`, `GET /students/:id`, `POST`, `PUT /:id`, `DELETE /:id` | professor |

### Autenticação

#### `POST /auth/login`
Login único para professores e alunos. Corpo: `email`, `password`.
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"professor@escola.com","password":"senha123"}' | jq
```
Retorna `200` com `data: { token, user: { id, name, email, role } }`, onde `role` é `teacher` ou
`student`, ou `401` se as credenciais forem inválidas. Para professores a resposta também traz
`teacher: { id, name, email }`, mantido por compatibilidade com o front-end web da Fase 3. O token expira conforme `JWT_EXPIRES_IN` (padrão `8h`).

Nos exemplos abaixo, `$TOKEN` é o valor de `data.token`.

### Posts

#### `GET /posts` (professor ou aluno)
Lista todos os posts, mais recentes primeiro.
```bash
curl http://localhost:3000/posts -H "Authorization: Bearer $TOKEN" | jq
```

#### `GET /posts/:id` (professor ou aluno)
Retorna um post específico. `404` se o ID não existir; `400` se o ID não for um ObjectId válido.
```bash
curl http://localhost:3000/posts/<ID> -H "Authorization: Bearer $TOKEN" | jq
```

#### `GET /posts/search?q=termo` (professor ou aluno)
Busca posts cujo título ou conteúdo contenham o termo informado (case-insensitive).
```bash
curl "http://localhost:3000/posts/search?q=node" -H "Authorization: Bearer $TOKEN" | jq
```

#### `POST /posts` (professor)
Cria um novo post. Corpo obrigatório: `title`, `content`, `author` (todos strings não vazias).
```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Meu post","content":"Conteúdo","author":"Professor X"}' | jq
```
Retorna `201` com o post criado, ou `400` se a validação falhar.

#### `PUT /posts/:id` (professor)
Atualiza um post existente. Aceita atualização parcial (envie só os campos que quer mudar).
```bash
curl -X PUT http://localhost:3000/posts/<ID> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Título atualizado"}' | jq
```
Retorna `200` com o post atualizado, `404` se não existir, `400` se o corpo for inválido.

#### `DELETE /posts/:id` (professor)
Remove um post.
```bash
curl -X DELETE http://localhost:3000/posts/<ID> -H "Authorization: Bearer $TOKEN" | jq
```
Retorna `200` com `data: null`, ou `404` se o post não existir.

### Professores e alunos

Os dois recursos seguem o mesmo contrato. Todas as rotas exigem um **professor** autenticado
(aluno recebe `403`).

| Campo | Professores (`/teachers`) | Alunos (`/students`) |
|---|---|---|
| `name` | obrigatório | obrigatório |
| `email` | obrigatório, único entre professores **e** alunos | obrigatório, único entre professores **e** alunos |
| `password` | obrigatório no `POST` (mín. 6 caracteres); opcional no `PUT` | igual ao de professores |

O hash da senha nunca é retornado pela API. Quem é cadastrado por aqui já pode fazer login em
`POST /auth/login`. Como o login é único, um email não pode existir como professor e como aluno
ao mesmo tempo (`409`).

#### `GET /teachers?page=1&limit=10` · `GET /students?page=1&limit=10`
Listagem paginada, em ordem alfabética. `page` padrão `1`; `limit` padrão `10`, máximo `50`.
```bash
curl "http://localhost:3000/teachers?page=1&limit=10" -H "Authorization: Bearer $TOKEN" | jq
```
```json
{
  "success": true,
  "data": {
    "items": [{ "_id": "...", "name": "Ana Souza", "email": "ana@escola.com" }],
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### `GET /teachers/:id` · `GET /students/:id`
Retorna um registro. `404` se não existir; `400` se o ID for inválido.

#### `POST /teachers` · `POST /students`
```bash
curl -X POST http://localhost:3000/teachers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana Souza","email":"ana@escola.com","password":"senha123"}' | jq

curl -X POST http://localhost:3000/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"João Lima","email":"joao@escola.com","password":"senha123"}' | jq
```
Retorna `201` com o registro criado, `400` se a validação falhar, `409` se o email já existir.

#### `PUT /teachers/:id` · `PUT /students/:id`
Atualização parcial. Retorna `200`, `404`, `400` ou `409` (email duplicado).

#### `DELETE /teachers/:id` · `DELETE /students/:id`
Retorna `200` com `data: null`, ou `404` se não existir.

## Testes

```bash
npm test              # roda a suíte de testes
npm run test:coverage # roda com relatório de cobertura
```

Os testes usam `mongodb-memory-server`, então não é necessário ter um MongoDB rodando para
testá-los — cada execução sobe um banco em memória isolado, que é destruído ao final.

A suíte cobre a camada de serviço (`postService` e `authService`, incluindo casos de erro) e
testes de integração via Supertest para os contratos HTTP de posts, professores e alunos
(criação, paginação, atualização, remoção, `401` sem token, `400` de validação e `409` de email
duplicado). O `jest.config.js` define um limite mínimo de 20% de cobertura de linhas —
abaixo disso, o comando falha (e o CI barra o merge).

## CI/CD

O workflow (`.github/workflows/ci-cd.yml`) roda em dois jobs:

1. **`lint-and-test`** — roda em todo push e pull request para `main`: lint, build do
   TypeScript e testes com cobertura.
2. **`build-and-push`** — roda apenas quando o código entra na `main` (após o job anterior
   passar): builda a imagem Docker e publica no GitHub Container Registry (GHCR), com as tags
   `latest` e o SHA do commit.

## Desafios e aprendizados

> Esta seção é um relato da experiência da equipe durante o desenvolvimento — substitua os
> colchetes abaixo pelas suas próprias palavras.

- **Ambiente WSL apontando para o Node do Windows:** durante a configuração inicial, o
  `npm run dev` falhava com um erro de caminho UNC, porque o terminal estava executando o
  Node.js do Windows em vez do Node nativo do WSL. Resolvido instalando o Node via `nvm`
  diretamente dentro do WSL.
- **ESLint 9 (flat config) sem globais de Node:** os arquivos de configuração (`eslint.config.js`,
  `jest.config.js`), por serem CommonJS puro, precisaram de um bloco de configuração à parte
  reconhecendo `require`/`module` como globais válidos — o preset padrão do ESLint assume
  ambiente de navegador/ESM por padrão.
- **Deprecação do TypeScript rumo à versão 6.0:** o valor `"moduleResolution": "node"`, usado
  inicialmente, passou a ser tratado como erro nas versões mais recentes do compilador. A solução
  não foi suprimir o aviso, mas migrar para `"NodeNext"`, a opção recomendada e não descontinuada.

- **Rodar sem Docker (Fase 4):** o Docker Desktop parou de responder no WSL (o motor Linux
  devolvia `Internal Server Error`), e o `npm run dev` parecia travado porque o driver do MongoDB
  espera 30 s antes de desistir. A conexão passou a falhar em 5 s com mensagem clara, e o
  `npm run db` passou a subir um MongoDB local com o binário do `mongodb-memory-server`, que já era
  dependência dos testes — sem instalar nada.
- **CRUD de professores e alunos (Fase 4):** o app mobile exigiu telas administrativas de
  professores e alunos, que não tinham endpoints. A API ganhou `/teachers` e `/students` com
  paginação (`?page=&limit=`).
- **Login de alunos e perfis (Fase 4):** na primeira versão os alunos eram só um cadastro, sem
  login. Depois de testar o app, a equipe decidiu que alunos também entram (e que ler os posts
  exige login). O JWT passou a carregar `role`, e o novo middleware `requireTeacher` devolve
  `403` para alunos nas rotas de escrita e de administração. Como professores e alunos ficam em
  coleções separadas, o email passou a ser checado nas duas para o login não ficar ambíguo.

## Autor

Victor Mendes — Pós-graduação em Full Stack Development (FIAP)