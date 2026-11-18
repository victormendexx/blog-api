import { z } from 'zod';

export const createStudentSchema = z.object({
  name: z.string().trim().min(1, 'O nome é obrigatório'),
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
});

export const updateStudentSchema = createStudentSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos um campo para atualizar (name, email ou password)',
  });

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
