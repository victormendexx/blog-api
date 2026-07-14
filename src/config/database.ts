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
    await mongoose.connect(uri);
    console.log('Conectado ao MongoDB');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('Conexão com o MongoDB foi encerrada');
});
