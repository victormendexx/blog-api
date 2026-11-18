import request from 'supertest';
import app from '../src/app';
import { Student } from '../src/models/Student';
import * as authService from '../src/services/authService';

async function getAuthToken(): Promise<string> {
  await authService.createTeacher('Professor Logado', 'auth-test@escola.com', 'senha123');
  const { token } = await authService.login('auth-test@escola.com', 'senha123');
  return token;
}

describe('rotas /students', () => {
  it('retorna 401 quando não autenticado', async () => {
    const list = await request(app).get('/students');
    const create = await request(app)
      .post('/students')
      .send({ name: 'Aluno', email: 'aluno@escola.com', password: 'senha123' });

    expect(list.status).toBe(401);
    expect(create.status).toBe(401);
  });

  it('cria um aluno e retorna 201', async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .post('/students')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'João Lima', email: 'joao@escola.com', password: 'senha123' });

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe('João Lima');
  });

  it('retorna 400 quando o email é inválido', async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .post('/students')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'João Lima', email: 'nao-e-email', password: 'senha123' });

    expect(response.status).toBe(400);
  });

  it('retorna 409 quando o email já está cadastrado', async () => {
    await Student.init();
    const token = await getAuthToken();
    const auth = { Authorization: `Bearer ${token}` };

    await request(app)
      .post('/students')
      .set(auth)
      .send({ name: 'A', email: 'a@escola.com', password: 'senha123' });
    const response = await request(app)
      .post('/students')
      .set(auth)
      .send({ name: 'B', email: 'a@escola.com', password: 'senha123' });

    expect(response.status).toBe(409);
  });

  it('lista alunos com paginação', async () => {
    const token = await getAuthToken();
    await Student.create([
      { name: 'Aluno 1', email: 'a1@escola.com', passwordHash: 'hash' },
      { name: 'Aluno 2', email: 'a2@escola.com', passwordHash: 'hash' },
      { name: 'Aluno 3', email: 'a3@escola.com', passwordHash: 'hash' },
    ]);

    const response = await request(app)
      .get('/students?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });
    expect(response.body.data.items).toHaveLength(2);
  });

  it('atualiza e remove um aluno', async () => {
    const token = await getAuthToken();
    const auth = { Authorization: `Bearer ${token}` };

    const created = await request(app)
      .post('/students')
      .set(auth)
      .send({ name: 'João Lima', email: 'joao@escola.com', password: 'senha123' });
    const id = created.body.data._id;

    const updated = await request(app).put(`/students/${id}`).set(auth).send({ name: 'João L.' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.name).toBe('João L.');

    const removed = await request(app).delete(`/students/${id}`).set(auth);
    expect(removed.status).toBe(200);

    const missing = await request(app).get(`/students/${id}`).set(auth);
    expect(missing.status).toBe(404);
  });

  it('retorna 400 para um ID inválido', async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .get('/students/id-invalido')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});
