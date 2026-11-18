import request from 'supertest';
import app from '../src/app';
import { Teacher } from '../src/models/Teacher';
import * as authService from '../src/services/authService';

async function getAuthToken(): Promise<string> {
  await authService.createTeacher('Professor Logado', 'auth-test@escola.com', 'senha123');
  const { token } = await authService.login('auth-test@escola.com', 'senha123');
  return token;
}

describe('rotas /teachers', () => {
  it('retorna 401 quando não autenticado', async () => {
    const response = await request(app).get('/teachers');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('cria um professor sem expor o hash da senha', async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .post('/teachers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ana Souza', email: 'ana@escola.com', password: 'senha123' });

    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe('ana@escola.com');
    expect(response.body.data.passwordHash).toBeUndefined();
  });

  it('o professor criado consegue fazer login', async () => {
    const token = await getAuthToken();

    await request(app)
      .post('/teachers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ana Souza', email: 'ana@escola.com', password: 'senha123' });

    const login = await request(app)
      .post('/auth/login')
      .send({ email: 'ana@escola.com', password: 'senha123' });

    expect(login.status).toBe(200);
    expect(login.body.data.token).toBeDefined();
  });

  it('retorna 400 quando a senha é curta demais', async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .post('/teachers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ana Souza', email: 'ana@escola.com', password: '123' });

    expect(response.status).toBe(400);
  });

  it('retorna 409 quando o email já está cadastrado', async () => {
    await Teacher.init();
    const token = await getAuthToken();

    const response = await request(app)
      .post('/teachers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Duplicado', email: 'auth-test@escola.com', password: 'senha123' });

    expect(response.status).toBe(409);
  });

  it('lista professores com paginação', async () => {
    const token = await getAuthToken();
    await authService.createTeacher('Bruno', 'bruno@escola.com', 'senha123');
    await authService.createTeacher('Carla', 'carla@escola.com', 'senha123');

    const response = await request(app)
      .get('/teachers?page=2&limit=2')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ page: 2, limit: 2, total: 3, totalPages: 2 });
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].passwordHash).toBeUndefined();
  });

  it('atualiza, busca por id e remove um professor', async () => {
    const token = await getAuthToken();
    const auth = { Authorization: `Bearer ${token}` };

    const created = await request(app)
      .post('/teachers')
      .set(auth)
      .send({ name: 'Ana Souza', email: 'ana@escola.com', password: 'senha123' });
    const id = created.body.data._id;

    const updated = await request(app).put(`/teachers/${id}`).set(auth).send({ name: 'Ana S.' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.name).toBe('Ana S.');

    const fetched = await request(app).get(`/teachers/${id}`).set(auth);
    expect(fetched.body.data.name).toBe('Ana S.');

    const removed = await request(app).delete(`/teachers/${id}`).set(auth);
    expect(removed.status).toBe(200);

    const missing = await request(app).get(`/teachers/${id}`).set(auth);
    expect(missing.status).toBe(404);
  });
});
