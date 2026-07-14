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

\`\`\`
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
\`\`\`

**Tratamento de erros centralizado:** em vez de `try/catch` repetido em cada controller, os
controllers são envolvidos por um `asyncHandler`, que encaminha qualquer erro assíncrono para um
middleware de erro único (`errorHandler`). Erros esperados (ex: "post não encontrado") são
lançados como `AppError`, que carrega o status HTTP correto; erros inesperados caem em um 500
genérico, sem vazar detalhes internos para o cliente.

**Validação de entrada:** os corpos das requisições `POST`/`PUT` são validados com
[Zod](https://zod.dev) antes de chegar ao controller, via um middleware `validate(schema)`.
Isso garante que a camada de negócio nunca recebe dado malformado.

**Formato de resposta:** todas as respostas seguem um envelope padronizado:

\`\`\`json
{ "success": true, "data": { /* ... */ } }
\`\`\`
\`\`\`json
{ "success": false, "error": "mensagem descrevendo o problema" }
\`\`\`

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

\`\`\`
src/
├── config/         # conexão com o banco de dados
├── controllers/    # camada HTTP (req/res)
├── models/         # schemas do Mongoose
├── routes/         # definição dos endpoints REST
├── services/       # regras de negócio e acesso ao banco
├── middlewares/     # validação, tratamento de erros, 404
├── utils/          # AppError, asyncHandler
├── validations/     # schemas Zod
├── app.ts          # instância do Express
└── server.ts       # ponto de entrada
tests/               # testes unitários e de integração (Jest + Supertest)
\`\`\`

## Como rodar localmente

Pré-requisitos: Node.js 20+, um MongoDB acessível (local, container avulso, ou Atlas).

\`\`\`bash
npm install
cp .env.example .env
# ajuste MONGODB_URI no .env se necessário

npm run dev
\`\`\`

O servidor sobe em `http://localhost:3000`. Verifique com:
\`\`\`bash
curl http://localhost:3000/health | jq
\`\`\`

## Como rodar com Docker

\`\`\`bash
docker compose up --build
\`\`\`

Isso sobe a API (porta 3000) e um container MongoDB juntos, já conectados entre si.

\`\`\`bash
docker compose down       # para os containers, mantém os dados
docker compose down -v    # para os containers e apaga os dados do Mongo
\`\`\`

## Variáveis de ambiente

| Variável       | Descrição                              | Exemplo                                  |
|----------------|-----------------------------------------|-------------------------------------------|
| `PORT`         | Porta em que a API escuta               | `3000`                                    |
| `NODE_ENV`     | Ambiente de execução                    | `development` / `production`              |
| `MONGODB_URI`  | String de conexão com o MongoDB         | `mongodb://localhost:27017/blog-api`       |

## Referência da API

Todos os endpoints estão sob o prefixo `/posts`.

### `GET /posts`
Lista todos os posts, mais recentes primeiro.
\`\`\`bash
curl http://localhost:3000/posts | jq
\`\`\`

### `GET /posts/:id`
Retorna um post específico. `404` se o ID não existir; `400` se o ID não for um ObjectId válido.
\`\`\`bash
curl http://localhost:3000/posts/<ID> | jq
\`\`\`

### `GET /posts/search?q=termo`
Busca posts cujo título ou conteúdo contenham o termo informado (case-insensitive).
\`\`\`bash
curl "http://localhost:3000/posts/search?q=node" | jq
\`\`\`

### `POST /posts`
Cria um novo post. Corpo obrigatório: `title`, `content`, `author` (todos strings não vazias).
\`\`\`bash
curl -X POST http://localhost:3000/posts \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Meu post","content":"Conteúdo","author":"Professor X"}' | jq
\`\`\`
Retorna `201` com o post criado, ou `400` se a validação falhar.

### `PUT /posts/:id`
Atualiza um post existente. Aceita atualização parcial (envie só os campos que quer mudar).
\`\`\`bash
curl -X PUT http://localhost:3000/posts/<ID> \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Título atualizado"}' | jq
\`\`\`
Retorna `200` com o post atualizado, `404` se não existir, `400` se o corpo for inválido.

### `DELETE /posts/:id`
Remove um post.
\`\`\`bash
curl -X DELETE http://localhost:3000/posts/<ID> | jq
\`\`\`
Retorna `200` com `data: null`, ou `404` se o post não existir.

## Testes

\`\`\`bash
npm test              # roda a suíte de testes
npm run test:coverage # roda com relatório de cobertura
\`\`\`

Os testes usam `mongodb-memory-server`, então não é necessário ter um MongoDB rodando para
testá-los — cada execução sobe um banco em memória isolado, que é destruído ao final.

A suíte cobre a camada de serviço (`postService`: criação, busca, atualização, remoção e busca
por termo, incluindo casos de erro) e testes de integração via Supertest para os principais
contratos HTTP. O `jest.config.js` define um limite mínimo de 20% de cobertura de linhas —
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

## Autor

Victor Mendes — Pós-graduação em Full Stack Development (FIAP)