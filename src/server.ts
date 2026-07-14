import 'dotenv/config';
import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 3000;

async function bootstrap(): Promise<void> {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

bootstrap();
