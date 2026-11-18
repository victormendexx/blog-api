import mongoose from 'mongoose';

/**
 * Conecta ao MongoDB usando a URI definida em MONGODB_URI.
 * Encerra o processo se a conexão falhar, já que a API não tem
 * utilidade nenhuma sem banco de dados.
 */
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI não foi definida nas variáveis de ambiente');
  }

  try {
    // Falha em 5s (o padrão do driver é 30s, o que parece um travamento no terminal)
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Conectado ao MongoDB');
  } catch (error) {
    console.error(
      `Não foi possível conectar ao MongoDB em ${uri}.\n` +
        'Verifique se o MongoDB está rodando (ex.: `docker compose up -d mongo`).\n',
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('Conexão com o MongoDB foi encerrada');
});
