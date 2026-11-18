import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Sobe um MongoDB local SEM Docker, para desenvolvimento.
 *
 * Usa o binário oficial do MongoDB baixado pelo `mongodb-memory-server` (o mesmo dos testes),
 * mas com os dados gravados em `.mongo-data/` — ou seja, os posts/professores/alunos
 * continuam lá depois de parar e subir de novo.
 *
 * Uso: `npm run db` em um terminal (deixe aberto) e `npm run dev` em outro.
 */
const PORT = Number(process.env.LOCAL_MONGO_PORT) || 27017;
const DB_PATH = path.resolve(__dirname, '../../.mongo-data');

async function start(): Promise<void> {
  mkdirSync(DB_PATH, { recursive: true });

  const mongo = await MongoMemoryServer.create({
    instance: { port: PORT, dbPath: DB_PATH, storageEngine: 'wiredTiger' },
  });

  console.log(`MongoDB local rodando em ${mongo.getUri()} (dados em ${DB_PATH})`);
  console.log('Deixe este terminal aberto. Ctrl+C para parar.');

  const stop = async () => {
    // doCleanup: false mantém os dados em .mongo-data
    await mongo.stop({ doCleanup: false });
    process.exit(0);
  };

  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

start().catch((error) => {
  console.error('Erro ao subir o MongoDB local:', error);
  process.exit(1);
});
