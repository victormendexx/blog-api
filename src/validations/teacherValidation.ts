import { z } from 'zod';

export const createTeacherSchema = z.object({
  name: z.string().trim().min(1, 'O nome é obrigatório'),
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
});

export const updateTeacherSchema = createTeacherSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos um campo para atualizar (name, email ou password)',
  });

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
