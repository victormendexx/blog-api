import { Types } from 'mongoose';
import * as postService from '../src/services/postService';

describe('postService', () => {
  describe('createPost', () => {
    it('cria um post com os dados fornecidos', async () => {
      const post = await postService.createPost({
        title: 'Título de teste',
        content: 'Conteúdo de teste',
        author: 'Autor de teste',
      });

      expect(post.id).toBeDefined();
      expect(post.title).toBe('Título de teste');
      expect(post.author).toBe('Autor de teste');
    });
  });

  describe('getPostById', () => {
    it('retorna o post quando o ID existe', async () => {
      const created = await postService.createPost({
        title: 'Post A',
        content: 'Conteúdo A',
        author: 'Autor A',
      });

      const found = await postService.getPostById(created.id as string);

      expect(found.title).toBe('Post A');
    });

    it('lança erro 404 quando o post não existe', async () => {
      const fakeId = new Types.ObjectId().toString();

      await expect(postService.getPostById(fakeId)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('lança erro 400 quando o ID é inválido', async () => {
      await expect(postService.getPostById('id-invalido')).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe('updatePost', () => {
    it('atualiza apenas os campos enviados, mantendo os demais', async () => {
      const created = await postService.createPost({
        title: 'Original',
        content: 'Conteúdo original',
        author: 'Autor original',
      });

      const updated = await postService.updatePost(created.id as string, {
        title: 'Atualizado',
      });

      expect(updated.title).toBe('Atualizado');
      expect(updated.content).toBe('Conteúdo original');
    });

    it('lança erro 404 ao tentar atualizar um post inexistente', async () => {
      const fakeId = new Types.ObjectId().toString();

      await expect(
        postService.updatePost(fakeId, { title: 'Não importa' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('deletePost', () => {
    it('remove um post existente', async () => {
      const created = await postService.createPost({
        title: 'Para deletar',
        content: 'Conteúdo',
        author: 'Autor',
      });

      await postService.deletePost(created.id as string);

      await expect(postService.getPostById(created.id as string)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('lança erro 404 ao tentar deletar um post inexistente', async () => {
      const fakeId = new Types.ObjectId().toString();

      await expect(postService.deletePost(fakeId)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('searchPosts', () => {
    it('encontra posts pelo termo no título ou conteúdo', async () => {
      await postService.createPost({
        title: 'Aprendendo Node.js',
        content: 'Conteúdo sobre APIs REST',
        author: 'Autor',
      });
      await postService.createPost({
        title: 'Outro assunto',
        content: 'Nada a ver com o termo buscado',
        author: 'Autor',
      });

      const results = await postService.searchPosts('node');

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Aprendendo Node.js');
    });

    it('lança erro 400 quando o termo de busca está vazio', async () => {
      await expect(postService.searchPosts('')).rejects.toMatchObject({ statusCode: 400 });
    });
  });
});