import * as authService from '../src/services/authService';

describe('authService', () => {
  describe('login', () => {
    it('retorna um token válido quando as credenciais estão corretas', async () => {
      await authService.createTeacher('Professor Teste', 'prof@escola.com', 'senha123');

      const result = await authService.login('prof@escola.com', 'senha123');

      expect(result.token).toBeDefined();
      expect(result.teacher.email).toBe('prof@escola.com');
    });

    it('lança erro 401 quando o email não existe', async () => {
      await expect(
        authService.login('inexistente@escola.com', 'qualquer'),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('lança erro 401 quando a senha está incorreta', async () => {
      await authService.createTeacher('Professor Teste', 'prof2@escola.com', 'senhaCorreta');

      await expect(
        authService.login('prof2@escola.com', 'senhaErrada'),
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });
});