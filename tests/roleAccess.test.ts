import request from 'supertest';
import app from '../src/app';
import * as authService from '../src/services/authService';

/** Cria um professor e um aluno e devolve o token de cada um. */
async function setupUsers(): Promise<{ teacherToken: string; studentToken: string }> {
  await authService.createTeacher('Professor', 'prof@escola.com', 'senha123');
  const { token: teacherToken } = await authService.login('prof@escola.com', 'senha123');

  await request(app)
    .post('/students')
    .set('Authorization', `Bearer ${teacherToken}`)
    .send({ name: 'Aluna', email: 'aluna@escola.com', password: 'senha123' });

  const studentLogin = await request(app)
    .post('/auth/login')
    .send({ email: 'aluna@escola.com', password: 'senha123' });

  return { teacherToken, studentToken: studentLogin.body.data.token };
}

describe('login e perfis', () => {
  it('aluno faz login e recebe role "student" (sem o campo legado teacher)', async () => {
    await setupUsers();

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'aluna@escola.com', password: 'senha123' });

    expect(response.status).toBe(200);
    expect(response.body.data.user).toMatchObject({ email: 'aluna@escola.com', role: 'student' });
    expect(response.body.data.teacher).toBeUndefined();
  });

  it('professor recebe role "teacher" e o campo legado teacher', async () => {
    await authService.createTeacher('Professor', 'prof@escola.com', 'senha123');

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'prof@escola.com', password: 'senha123' });

    expect(response.body.data.user.role).toBe('teacher');
    expect(response.body.data.teacher.email).toBe('prof@escola.com');
  });

  it('aluno lê posts, mas recebe 403 ao tentar escrever', async () => {
    const { teacherToken, studentToken } = await setupUsers();

    await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ title: 'Post', content: 'Conteúdo', author: 'Professor' });

    const list = await request(app).get('/posts').set('Authorization', `Bearer ${studentToken}`);
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);

    const create = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Post do aluno', content: 'Conteúdo', author: 'Aluna' });
    expect(create.status).toBe(403);
  });

  it('aluno recebe 403 nas rotas de professores e alunos', async () => {
    const { studentToken } = await setupUsers();
    const auth = { Authorization: `Bearer ${studentToken}` };

    expect((await request(app).get('/teachers').set(auth)).status).toBe(403);
    expect((await request(app).get('/students').set(auth)).status).toBe(403);
  });

  it('não permite o mesmo email como professor e como aluno (409)', async () => {
    const { teacherToken } = await setupUsers();
    const auth = { Authorization: `Bearer ${teacherToken}` };

    const studentWithTeacherEmail = await request(app)
      .post('/students')
      .set(auth)
      .send({ name: 'X', email: 'prof@escola.com', password: 'senha123' });
    expect(studentWithTeacherEmail.status).toBe(409);

    const teacherWithStudentEmail = await request(app)
      .post('/teachers')
      .set(auth)
      .send({ name: 'Y', email: 'aluna@escola.com', password: 'senha123' });
    expect(teacherWithStudentEmail.status).toBe(409);
  });

  it('a senha do aluno nunca aparece nas respostas', async () => {
    const { teacherToken } = await setupUsers();

    const response = await request(app)
      .get('/students')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(response.body.data.items[0].passwordHash).toBeUndefined();
  });
});
