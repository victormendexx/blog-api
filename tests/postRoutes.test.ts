import request from 'supertest';
import app from '../src/app';
import * as authService from '../src/services/authService';

async function getAuthToken(): Promise<string> {
  await authService.createTeacher('Professor Teste', 'auth-test@escola.com', 'senha123');
  const { token } = await authService.login('auth-test@escola.com', 'senha123');
  return token;
}

describe('POST /posts', () => {
  it('cria um post e retorna 201 quando autenticado', async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Novo post', content: 'Conteúdo do post', author: 'Autor' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Novo post');
  });

  it('retorna 401 quando não autenticado', async () => {
    const response = await request(app)
      .post('/posts')
      .send({ title: 'Novo post', content: 'Conteúdo do post', author: 'Autor' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('retorna 400 quando falta um campo obrigatório', async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Post incompleto' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

describe('GET /posts/:id', () => {
  it('retorna 404 para um post inexistente quando autenticado', async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .get('/posts/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('retorna 401 quando não autenticado (leitura exige login)', async () => {
    const response = await request(app).get('/posts');

    expect(response.status).toBe(401);
  });
});

describe('DELETE /posts/:id', () => {
  it('remove um post existente e retorna 200 quando autenticado', async () => {
    const token = await getAuthToken();

    const createResponse = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Post a ser removido', content: 'Conteúdo', author: 'Autor' });

    const postId = createResponse.body.data._id;

    const deleteResponse = await request(app)
      .delete(`/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
  });

  it('retorna 401 quando não autenticado', async () => {
    const response = await request(app).delete('/posts/000000000000000000000000');

    expect(response.status).toBe(401);
  });
});
