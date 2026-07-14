import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().trim().min(1, 'O título é obrigatório'),
  content: z.string().trim().min(1, 'O conteúdo é obrigatório'),
  author: z.string().trim().min(1, 'O autor é obrigatório'),
});

export const updatePostSchema = createPostSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos um campo para atualizar (title, content ou author)',
  });

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;