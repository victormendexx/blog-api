import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rota de health check - confirma que o servidor está de pé
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

// Rotas da aplicação (monta /posts, etc.)
app.use(routes);

// 404 para rotas não mapeadas
app.use(notFoundHandler);

// Tratamento de erros - precisa ser o último middleware registrado
app.use(errorHandler);

export default app;