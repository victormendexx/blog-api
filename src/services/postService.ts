import { Types } from 'mongoose';
import { Post, IPost } from '../models/Post';
import { AppError } from '../utils/AppError';
import { CreatePostInput, UpdatePostInput } from '../validations/postValidation';

/** Lista todos os posts, mais recentes primeiro. */
export async function listPosts(): Promise<IPost[]> {
  return Post.find().sort({ createdAt: -1 });
}

/** Busca um post pelo ID. Lança AppError 404 se não existir, 400 se o ID for inválido. */
export async function getPostById(id: string): Promise<IPost> {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('ID de post inválido', 400);
  }

  const post = await Post.findById(id);

  if (!post) {
    throw new AppError('Post não encontrado', 404);
  }

  return post;
}

/** Cria um novo post. O corpo já chega validado pelo middleware `validate`. */
export async function createPost(data: CreatePostInput): Promise<IPost> {
  return Post.create(data);
}

/** Atualiza um post existente (atualização parcial: só os campos enviados mudam). */
export async function updatePost(id: string, data: UpdatePostInput): Promise<IPost> {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('ID de post inválido', 400);
  }

  const post = await Post.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!post) {
    throw new AppError('Post não encontrado', 404);
  }

  return post;
}

/** Remove um post pelo ID. */
export async function deletePost(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('ID de post inválido', 400);
  }

  const post = await Post.findByIdAndDelete(id);

  if (!post) {
    throw new AppError('Post não encontrado', 404);
  }
}

/** Busca posts cujo título ou conteúdo contenham o termo (case-insensitive, substring). */
export async function searchPosts(term: string): Promise<IPost[]> {
  if (!term || !term.trim()) {
    throw new AppError('Informe um termo de busca através da query "q"', 400);
  }

  const regex = new RegExp(term.trim(), 'i');

  return Post.find({
    $or: [{ title: regex }, { content: regex }],
  }).sort({ createdAt: -1 });
}