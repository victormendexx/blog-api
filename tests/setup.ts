import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

// Sobe um MongoDB em memória uma vez, antes de todos os testes
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

// Limpa todas as coleções entre os testes, para um teste não afetar o outro
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

// Encerra a conexão e derruba o Mongo em memória ao final da suíte
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});