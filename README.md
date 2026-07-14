# Blog API — Tech Challenge Fase 2

> Em construção. A documentação completa (arquitetura, uso da API, desafios enfrentados) será adicionada no Passo 8.

## Status atual: Passo 1 — Setup do projeto

Estrutura inicial criada com Node.js + TypeScript + Express. Ainda sem conexão com banco e sem os endpoints de `/posts` (isso vem nos próximos passos).

## Como rodar (checkpoint deste passo)

```bash
npm install
cp .env.example .env
npm run dev
```

Depois, em outro terminal:

```bash
curl http://localhost:3000/health
# esperado: {"status":"ok"}
```

## Estrutura de pastas

```
src/
├── config/        # configuração de banco, env, etc. (Passo 2)
├── controllers/    # camada que recebe req/res e chama os services
├── models/         # schemas do Mongoose
├── routes/         # definição dos endpoints REST
├── services/       # regras de negócio, acesso ao banco
├── middlewares/     # tratamento de erros, validações, etc.
├── utils/          # funções auxiliares
├── app.ts          # instância do Express e middlewares globais
└── server.ts       # ponto de entrada, sobe o servidor HTTP
tests/               # testes unitários (Jest + Supertest)
```
