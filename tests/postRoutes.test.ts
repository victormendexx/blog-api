import request from 'supertest';
import app from '../src/app';

describe('POST /posts', () => {
  it('cria um post e retorna 201', async () => {
    const response = await request(app).post('/posts').send({
      title: 'Novo post',
      content: 'Conteúdo do post',
      author: 'Autor',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Novo post');
  });

  it('retorna 400 quando falta um campo obrigatório', async () => {
    const response = await request(app).post('/posts').send({
      title: 'Post incompleto',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

describe('GET /posts/:id', () => {
  it('retorna 404 para um post inexistente', async () => {
    const response = await request(app).get('/posts/000000000000000000000000');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});

describe('DELETE /posts/:id', () => {
  it('remove um post existente e retorna 200', async () => {
    const createResponse = await request(app).post('/posts').send({
      title: 'Post a ser removido',
      content: 'Conteúdo',
      author: 'Autor',
    });

    const postId = createResponse.body.data._id;

    const deleteResponse = await request(app).delete(`/posts/${postId}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
  });
});